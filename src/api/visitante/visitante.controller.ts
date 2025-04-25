import { Controller, Get, Req, Res, Param, Query } from '@nestjs/common';
import { VisitanteService } from './visitante.service';
import * as path from 'path';

@Controller('')
export class VisitanteController {
    constructor(
        private readonly vistanteService: VisitanteService
    ) {}

    // ✅ getProductosTienda con paginación y filtros
    @Get('getProductosTienda')
    async getProductosTienda(
        @Req() req,
        @Res() res,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('genero') genero?: string,
        @Query('categorias') categorias?: string, // coma separada: 123,456
        @Query('precio') precio?: string          // ej: 50-100
    ) {
        try {
            const productos = await this.vistanteService.getProductosTienda(
                Number(page),
                Number(limit),
                genero,
                categorias,
                precio
            );
            res.status(200).send(productos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener productos', error });
        }
    }

    @Get('getProductoImagenes/:file')
    async getProductoImagenes(@Req() req, @Res() res, @Param('file') file) {
        const file_ = path.join(__dirname, '../../../uploads/productos/', file);
        res.status(200).sendFile(file_);
    }

    @Get('getCategoriasTienda/:clasificacion')
    async getCategoriasTienda(@Req() req, @Res() res , @Param('clasificacion') clasificacion) {
        const categorias = await this.vistanteService.getCategoriasTienda(clasificacion);
        res.status(200).send(categorias);
    }

    @Get('getProductoTienda/:slug')
    async getProductoTienda(@Req() req, @Res() res , @Param('slug') slug) {
        const producto = await this.vistanteService.getProductoTienda(slug);
        res.status(200).send(producto);
    }
}
