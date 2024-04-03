import { Pipe, PipeTransform } from '@angular/core';
import { compareAsc } from 'date-fns';

@Pipe({
  standalone: true,
  name: 'alertaReserva'
})
export class AlertaReservaPipe implements PipeTransform {
  transform(fechaAlerta: any, estado: string): any {
    let comparacion = compareAsc(new Date(), new Date(fechaAlerta));
    return (comparacion === 1 && estado === 'Pendiente') ? true : false;
  }
}
