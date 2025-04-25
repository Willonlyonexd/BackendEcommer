import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuarioModule } from './api/usuario/usuario.module';
import { SegmentationModule } from './api/segmentation/segmentation.module';

import { ProductoModule } from './api/producto/producto.module';

import { LogModule } from './api/log/log.module';
import { RolModule } from './api/rol/rol.module';
import { FuncionalidadModule } from './api/funcionalidad/funcionalidad.module';
import { IngresoModule } from './api/ingreso/ingreso.module';
import { InventarioModule } from './api/inventario/inventario.module';
import { TenantModule } from './api/tenant/tenant.module';
import { TclienteModule } from './api/tcliente/tcliente.module';


import { EmailsModule } from './api/emails/emails.module';

import { VisitanteModule } from './api/visitante/visitante.module';

import { VentaModule } from './api/venta/venta.module';

import { ProveedorModule } from './api/proveedor/proveedor.module';

import { AlmacenModule } from './api/almacen/almacen.module';
import { EstadisticaModule } from './api/estadistica/estadistica.module';
import { ReporteModule } from './api/reporte/reporte.module';
import { PagoModule } from './api/pago/pago.module';






@Module({

  imports: [

    MongooseModule.forRoot('mongodb://localhost:27017/tecnoWeb'),
    MongooseModule.forRoot('mongodb://localhost:27017/tecnoWeb', { connectionName: 'logsConnection' }),
    // MongooseModule.forRoot('mongodb+srv://juniorzamo:juniorzamo1999@tecnoweb.8qtyd.mongodb.net/proyecto1?retryWrites=true&w=majority&appName=proyecto1'),
    //MongooseModule.forRoot('mongodb+srv://juniorzamo:juniorzamo1999@tecnoweb.8qtyd.mongodb.net/log?retryWrites=true&w=majority&appName=proyecto1', { connectionName: 'logsConnection' }),
    UsuarioModule,
    ProductoModule,
    LogModule,
    RolModule,
    FuncionalidadModule,
    IngresoModule,
    InventarioModule,
    TenantModule,
    TclienteModule,
    EmailsModule,
    VisitanteModule,
    VentaModule,
    ProveedorModule,
    AlmacenModule,
    EstadisticaModule,
    ReporteModule,
    PagoModule,
    SegmentationModule
  ],
  controllers: [AppController,],
  providers: [AppService,
  ],
})
export class AppModule {

}