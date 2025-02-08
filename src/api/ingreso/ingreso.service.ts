import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class IngresoService {

    constructor(
        @InjectModel('ingreso') private ingresoModel,
        @InjectModel('producto') private productoModel,
        @InjectModel('ingresoDetalle') private ingresoDetalleModel
    ) { }

    async createIngreso(data:any, usuario:any) {
       try {
        const ingreso= await this.ingresoModel.find().sort({createdAT:-1});
        let codigo=0;
        if(ingreso.length==0){
            codigo=1
        }else{
            codigo=ingreso[0].codigo+1;
        }

        data.usuario=usuario.sub;
        data.codigo=codigo;
        const regIngreso= await this.ingresoModel.create(data);

        for(const item of data.detalles){

            const producto = await this.productoModel.findOne({_id:item.producto}).populate('categoria')
            
            item.ingreso=regIngreso._id
            item.almacen=regIngreso.almacen
            
            
            for (let i = 0; i < item.cantidad; i++) {
                item.codigo=producto.titulo.substring(0,2)+''+producto.categoria.titulo.substring(0,2)+''+data.almacen.substring(0,2)+''+uuidv4().split('-')[0].toUpperCase()
                await this.ingresoDetalleModel.create(item)
            }
        }
        return {data:regIngreso}
 
       } catch (error) {
        console.log(error)  
            return {data:undefined, message:'no se pudo crear los ingresos'}
       }
    }

    async getIngresos(inicio,fin) {
      try {

        const ingresos = await this.ingresoModel.find({createdAT:{
            $gte:new Date(inicio+'T00:00:00'),
            $lte:new Date(fin+'T23:59:59'),
        }}).populate('usuario').sort({createdAT: -1})
        
        return {data:ingresos};    
      } catch (error) {
        return {data:undefined, message:'no se pudo obtener los ingresos'}
      }
    }


    async getIngreso(id) {
        try {
            const ingreso = await this.ingresoModel.findOne({_id:id,}).populate('usuario').populate('almacen').populate('proveedor')
            if(!ingreso){
                return {data:undefined, message:'no se pudo obtener el ingreso'}
            }else{
                const detalles = await this.ingresoDetalleModel.find({ingreso:id}).populate('producto').populate('producto_variedad')
                return {data:{ingreso,detalles}}
            }
        } catch (error) {
            console.log(error)
            return {data:undefined, message:'no se pudo obtener los ingresos'}
        }
    }


    async cambiarEstadoIngreso(id,data) {
        try {
            const ingreso = await this.ingresoModel.findOne({_id:id})
            if(!ingreso){
                return {data:undefined, message:'no se pudo obtener el ingreso'}
            }else{
               const ingresoUpdate = await this.ingresoModel.findOneAndUpdate({_id:id},{estado:data.estado})
               
               let booEstado
               if(data.estado=='Cancelado'){
                   booEstado=false
                }else if(data.estado=='Confirmado'){
                    booEstado=true
                }

               await this.ingresoDetalleModel.updateMany({ingreso:id},{estado_:data.estado_,estado:booEstado})


                return {data:ingresoUpdate}
            }
        } catch (error) {
            return {data:undefined, message:'no se pudo cambiar el estado del ingreso'}
        }
    }

    async getIngresosAlmacen(id){
        try {
            console.log(id)
            const ingresos = await this.ingresoDetalleModel.find({estado_:'Confirmado',estado:true,almacen:id}).populate('ingreso').populate('producto').populate('producto_variedad').populate('almacen').sort({createdAT:-1})
            
            return {data:ingresos};    
          } catch (error) {
            return {data:undefined, message:'no se pudo obtener los ingresos'}
        }
    }

    async createEgreso  (data:any, usuario:any) {
     try {

        console.log(data)
        const ingreso= await this.ingresoModel.find({tipo:"egreso"}).sort({createdAT:-1});
        let codigo=0;
        if(ingreso.length==0){
            codigo=1
        }else{
            codigo=ingreso[0].codigo+1;
        }

        data.usuario=usuario.sub;
        data.codigo=codigo;
        data.tipo='Egreso'
        data.estado='Procesado'
        const regIngreso= await this.ingresoModel.create(data);
        
        
        for(const item of data.detalles){

            const ingresos=await this.ingresoDetalleModel.find(
                {   producto:item.producto,
                    producto_variedad:item.producto_variedad,
                    almacen:data.almacen,
                    estado:true,
                    estado_:"Confirmado"
                }).sort({createdAT:-1}).limit(item.cantidad)

                console.log(ingresos.length)
                for (const ingreso of ingresos) {
                    await this.ingresoDetalleModel.findOneAndUpdate({_id:ingreso._id},{estado:false})
                }

        }

        return {data:regIngreso}

     } catch (error) {
        console.log(error)  
        return {data:undefined, message:'no se pudo crear los ingresos'}
     }           
    }

    async BuscarProductoAlmacen(almacen,producto,variead,cantidad) {
        
        try {
            const ingresosProducto = await this.ingresoDetalleModel.find({producto:producto,almacen:almacen,estado:true,estado_:"Confirmado"}).sort({createdAT:-1})

            if(ingresosProducto.length==0){
                return {data:undefined, message:'no se encuentra el producto en el almacen'}
            }

            const productoVariedad= await this.ingresoDetalleModel.find({producto:producto,producto_variedad:variead,almacen:almacen,estado:true,estado_:"Confirmado"}).sort({createdAT:-1})
            if(productoVariedad.length==0){
                return {data:undefined, message:'no se encuentra la variedad del producto en el almacen'}
            }


            if(productoVariedad.length<cantidad){
                return {data:undefined, message:'no se encuentra la cantidad del producto en el almacen'}
            }

            return {cantidad:productoVariedad.length, message:'OK'}

           
              
          } catch (error) {
            return {data:undefined, message:'no se pudo obtener los ingresos'}
        }
    
    }

}
