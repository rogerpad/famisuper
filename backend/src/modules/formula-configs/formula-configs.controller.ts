import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { FormulaConfigsService } from './formula-configs.service';
import { CreateFormulaConfigDto } from './dto/create-formula-config.dto';
import { UpdateFormulaConfigDto } from './dto/update-formula-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('formula-configs')
@UseGuards(JwtAuthGuard)
export class FormulaConfigsController {
  constructor(private readonly formulaConfigsService: FormulaConfigsService) {}

  @Post()
  create(@Body() createFormulaConfigDto: CreateFormulaConfigDto) {
    return this.formulaConfigsService.create(createFormulaConfigDto);
  }

  @Get()
  findAll() {
    return this.formulaConfigsService.findAll();
  }

  @Get('provider/:id')
  findByProvider(@Param('id') id: string) {
    return this.formulaConfigsService.findByProvider(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formulaConfigsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormulaConfigDto: UpdateFormulaConfigDto) {
    return this.formulaConfigsService.update(+id, updateFormulaConfigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formulaConfigsService.remove(+id);
  }

  @Post('provider/:id/bulk-update')
  updateBulkForProvider(
    @Param('id') id: string,
    @Body() configs: { tipoTransaccionId: number; incluirEnCalculo: boolean; factorMultiplicador: number }[]
  ) {
    return this.formulaConfigsService.updateBulkForProvider(+id, configs);
  }

  @Get('provider/:id/calculate')
  calculateResultadoFinal(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.formulaConfigsService.calculateResultadoFinal(+id, startDate, endDate);
  }
}
