import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {

    transform(value) {
        let dateFormat = moment(value).format('DD/MM/YYYY - HH:mm ')
        return (dateFormat)
    }
}
