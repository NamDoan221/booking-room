import { Pipe, PipeTransform } from "@angular/core";
import { IStatusProductCategory } from "../../shared/services/product-category/interfaces/product-category.interface";

@Pipe({
  name: 'GetStatusByKeyPipe',
  standalone: true
})
export class GetStatusByKeyPipe implements PipeTransform {

  transform(value: string, data: IStatusProductCategory[], keyFetch: string) {
    keyFetch;
    return data.find(item => item.key === value)?.name || '';
  }
}