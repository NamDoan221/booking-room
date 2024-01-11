import { Pipe, PipeTransform } from "@angular/core";
import { IProductCategory, IStatusProductCategory } from "../../shared/services/product-category/interfaces/product-category.interface";

@Pipe({
  name: 'GetNameCategoryByIdPipe',
  standalone: true
})
export class GetNameCategoryByIdPipe implements PipeTransform {

  transform(value: string, data: Array<IProductCategory>, keyFetch: string) {
    keyFetch;
    return data.find(item => item.id === value)?.name || '';
  }
}