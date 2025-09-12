import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter',
  standalone: true
})
export class SearchFilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, keys: string[]): any[] {
    if (!items || !searchText) return items;

    const term = searchText.toLowerCase();

    return items.filter(item =>
      keys.some(key => String(item[key]).toLowerCase().includes(term))
    );
  }
}
