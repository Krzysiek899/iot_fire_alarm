import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'multiplyAndRound'
})
export class MultiplyAndRoundPipe implements PipeTransform {
  transform(value: number, multiplier: number = 100, precision: number = 2): string {
    if (!value) return '0.00';
    return (value * multiplier).toFixed(precision);
  }
}

