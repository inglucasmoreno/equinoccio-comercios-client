import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'filtroIngresos'
})
export class FiltroIngresosPipe implements PipeTransform {

  transform(valores: any[], parametro: string, estado: string): any {

    let filtrados: any[];

    if (estado === 'Pendiente') {
      filtrados = valores.filter(valor => {
        return valor.estado === 'Pendiente';
      });
    } else if (estado === 'Completado') {
      filtrados = valores.filter(valor => {
        return valor.estado === 'Completado';
      });
    } else {
      filtrados = valores;
    }

    // Filtrado por parametro
    parametro = parametro.toLocaleLowerCase();

    if (parametro.length !== 0) {
      return filtrados.filter(valor => {
        return valor.nroFactura.toLocaleLowerCase().includes(parametro) ||
          valor.comentario.toLocaleLowerCase().includes(parametro) ||
          valor.id === Number(parametro)
      });
    } else {
      return filtrados;
    }

  }
}
