import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'moneda'
})
export class MonedaPipe implements PipeTransform {

  transform(precio: number): any {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(precio);
  }

}
