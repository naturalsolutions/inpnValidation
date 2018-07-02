import { Component, OnInit, Input } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ImagesService } from '../services/images.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { User } from '../user';
import { TextService } from '../services/text.service';



@Component({
  selector: 'app-gallery-thumbnail',
  templateUrl: './gallery-thumbnail.component.html',
  styleUrls: ['./gallery-thumbnail.component.scss']
})
export class GalleryThumbnailComponent implements OnInit {

  idValidateur: string;
  valdidate: boolean = false;
  istreated: boolean = false;
  totalItems: number;
  photosLoaded: boolean = false;
  closeResult: string;
  @Input() currentUser: User;
  photos;
  selectedPhoto;
  private modalRef: NgbModalRef;
  private currentPage: number = 1;
  private nbItems: number = 23;
  private previousPage: number = 1;
  helpText;

  constructor(private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private textService: TextService,
    private imagesService: ImagesService, ) {

  }

  ngOnInit() {
    this.idValidateur = (this.currentUser.attributes.ID_UTILISATEUR).toString();
    this.getPhotos(this.currentPage, this.nbItems + 1);
    this.textService.getText(1).subscribe((text) => { this.helpText = text; console.log("text", text) }
    )
  }

  loadPage(page: number) {
    let paginStart;
    let paginEnd;
    if (page !== this.previousPage) {
      if (page > 1)
        paginStart = this.nbItems * (page - 1);
      else
        paginStart = 1;
      this.previousPage = page;
      paginEnd = paginStart + this.nbItems
      this.getPhotos(paginStart, paginEnd)
    }
  }

  getPhotos(paginStart, paginEnd) {
    this.spinner.show();
    this.imagesService.getPhotos({
      paginStart: paginStart,
      paginEnd: paginEnd
    }, { filtrePhotosTreated: "false" })
      .subscribe(
        (photos) => {
          this.photos = photos.Photos;
          this.totalItems = photos.totLines
        },
        (error) => console.log("getPhotoErr : ", error),
        () => {
          this.photosLoaded = true;
          this.spinner.hide();
        }
      )
  }

  open(content, photo) {
    this.selectedPhoto = photo;
    if (this.selectedPhoto.isTreated == "false")
      this.modalRef = this.modalService.open(content, { centered: true, windowClass: 'css-modal' })
  }

  public validatePhoto(cdPhoto, idValidateur, isValidated) {
    this.imagesService.validatePhoto(cdPhoto, idValidateur, isValidated).subscribe(() => {
      _.map(this.photos, (value) => {
        if (value.cdPhoto == cdPhoto) {
          value.isTreated = 'true';
          value.isValidated = isValidated;
        }
        return value
      });
      this.modalRef.close()
    })
  }

  openHelp(helpModal) {
    this.modalService.open(helpModal, { centered: true, windowClass: 'help-modal'})
  }


  public quickValidate(event, cdPhoto, idValidateur, isValidated) {
    event.stopPropagation()
    this.imagesService.validatePhoto(cdPhoto, idValidateur, isValidated).subscribe(() => {
      _.map(this.photos, (value) => {
        if (value.cdPhoto == cdPhoto) {
          value.isTreated = 'true';
          value.isValidated = isValidated;
        }
        return value
      });
    })
  }

}
