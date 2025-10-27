import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { AdditionalLoanService } from './additional-loan.service';
import { 
  CreateAdditionalLoanDto, 
  UpdateAdditionalLoanDto
} from './dto';
import { AdditionalLoan } from './entities/additional-loan.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@Controller('adicionales-prestamos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdditionalLoanController {
  constructor(private readonly additionalLoanService: AdditionalLoanService) {}

  @Post()
  @RequirePermissions('crear_editar_adic_prest')
  create(@Body() createAdditionalLoanDto: CreateAdditionalLoanDto, @Req() req: Request): Promise<AdditionalLoan> {
    const userId = req.user ? req.user['id'] : undefined;
    console.log('[AdditionalLoanController] userId del request:', userId);
    return this.additionalLoanService.create(createAdditionalLoanDto, userId);
  }

  @Get()
  @RequirePermissions('ver_adic_presta')
  async findAll(
    @Query('acuerdo') acuerdo?: string,
    @Query('origen') origen?: string,
    @Query('activo') activo?: string,
  ): Promise<AdditionalLoan[]> {
    // Convertir el string 'true'/'false' a boolean si existe
    const activoBoolean = activo ? activo === 'true' : undefined;
    
    const result = await this.additionalLoanService.findAll({
      acuerdo,
      origen,
      activo: activoBoolean,
    });
    
    console.log('[AdditionalLoanController] findAll - Total registros:', result.length);
    if (result.length > 0) {
      console.log('[AdditionalLoanController] findAll - Primer registro:', JSON.stringify(result[0]));
    }
    
    return result;
  }

  @Get(':id')
  @RequirePermissions('ver_adic_presta')
  findOne(@Param('id') id: string): Promise<AdditionalLoan> {
    return this.additionalLoanService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('crear_editar_adic_prest')
  update(
    @Param('id') id: string, 
    @Body() updateAdditionalLoanDto: UpdateAdditionalLoanDto
  ): Promise<AdditionalLoan> {
    return this.additionalLoanService.update(+id, updateAdditionalLoanDto);
  }

  @Delete(':id')
  @RequirePermissions('eliminar_adic_prest')
  remove(@Param('id') id: string): Promise<void> {
    return this.additionalLoanService.remove(+id);
  }
}
