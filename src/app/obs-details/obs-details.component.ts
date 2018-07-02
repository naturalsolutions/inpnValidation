import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ObservationService } from '../services/observation.service';
@Component({
  selector: 'app-obs-details',
  templateUrl: './obs-details.component.html',
  styleUrls: ['./obs-details.component.scss']
})
export class ObsDetailsComponent implements OnInit {
  id;
  observation: any;
  constructor(private route: ActivatedRoute,
    private observationService: ObservationService
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.observationService.getObsByID(this.id).subscribe((obs) => this.observation=obs,
  (err)=> console.log("err",err),
  ()=>{
    console.log('id', this.id);
    console.log("obsDetails", this.observation);

  }
  )
   

  }

}
