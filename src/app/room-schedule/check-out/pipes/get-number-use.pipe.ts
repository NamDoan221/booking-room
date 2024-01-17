import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'GetNumberUsePipe',
  standalone: true
})
export class GetNumberUsePipe implements PipeTransform {

  transform(id: string, productUse: Array<{ id_product: string, number: number }>, keyFetch: string) {
    keyFetch;
    return productUse.find(item => item.id_product === id)?.number || 0;
  }
}