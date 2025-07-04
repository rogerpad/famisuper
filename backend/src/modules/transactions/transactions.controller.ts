import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Transaction } from './entities/transaction.entity';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva transacción' })
  @ApiResponse({ status: 201, description: 'Transacción creada exitosamente', type: Transaction })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Agente o tipo de transacción no encontrado' })
  create(@Body() createTransactionDto: CreateTransactionDto, @Req() req: Request) {
    // Obtener el ID del usuario desde el token JWT
    // En NestJS con JWT, el objeto req.user contiene los datos del usuario autenticado
    const user = req.user as any; // Usamos any temporalmente para evitar problemas de tipo
    const userId = user.id;
    
    console.log(`Creando transacción con usuario autenticado ID: ${userId}`);
    
    // Sobrescribir el usuarioId en el DTO con el ID del usuario autenticado
    const transactionWithAuthUser = {
      ...createTransactionDto,
      usuarioId: userId
    };
    
    return this.transactionsService.create(transactionWithAuthUser);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las transacciones activas' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones activas', type: [Transaction] })
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('all')
  @ApiOperation({ summary: 'Obtener todas las transacciones incluyendo inactivas' })
  @ApiResponse({ status: 200, description: 'Lista completa de transacciones', type: [Transaction] })
  findAllWithInactive() {
    return this.transactionsService.findAllWithInactive();
  }
  
  @Get('summary')
  @ApiOperation({ summary: 'Obtener transacciones activas para el resumen' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones activas para el resumen', type: [Transaction] })
  getTransactionsForSummary() {
    return this.transactionsService.getTransactionsForSummary();
  }
  
  @Get('summary/date-range')
  @ApiOperation({ summary: 'Obtener transacciones activas por rango de fechas para el resumen' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Fecha inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'Fecha final (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones activas en el rango de fechas para el resumen', type: [Transaction] })
  @ApiResponse({ status: 400, description: 'Fechas inválidas' })
  getTransactionsByDateRangeForSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.getTransactionsByDateRangeForSummary(startDate, endDate);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Obtener transacciones por rango de fechas' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Fecha inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'Fecha final (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones en el rango de fechas', type: [Transaction] })
  @ApiResponse({ status: 400, description: 'Fechas inválidas' })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.findByDateRange(startDate, endDate);
  }

  @Get('agent/:id')
  @ApiOperation({ summary: 'Obtener transacciones por agente' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones del agente', type: [Transaction] })
  @ApiResponse({ status: 404, description: 'Agente no encontrado' })
  findByAgent(@Param('id') id: string) {
    return this.transactionsService.findByAgent(+id);
  }

  @Get('type/:id')
  @ApiOperation({ summary: 'Obtener transacciones por tipo de transacción' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones del tipo especificado', type: [Transaction] })
  @ApiResponse({ status: 404, description: 'Tipo de transacción no encontrado' })
  findByTransactionType(@Param('id') id: string) {
    return this.transactionsService.findByTransactionType(+id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una transacción por ID' })
  @ApiResponse({ status: 200, description: 'Transacción encontrada', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una transacción' })
  @ApiResponse({ status: 200, description: 'Transacción actualizada exitosamente', type: Transaction })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Transacción, agente o tipo de transacción no encontrado' })
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una transacción' })
  @ApiResponse({ status: 200, description: 'Transacción eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}
