import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';

@Injectable()
export class FilterService {

    private numberFilterSelected: BehaviorSubject<number> = new BehaviorSubject(0);
    private filter: BehaviorSubject<string> = new BehaviorSubject('init');


    getFilterNotifications(): Observable<number> {
        return this.numberFilterSelected.asObservable()
    }
    setFilterNotifications(nbfilter) {
        this.numberFilterSelected.next(nbfilter)
    }

    getFilter() {
        return this.filter.asObservable()
    }
    setFilter(filter) {
        this.filter.next(filter)
    }

    
}