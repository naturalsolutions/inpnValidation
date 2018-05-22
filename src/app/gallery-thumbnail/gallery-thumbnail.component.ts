import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ImagesService } from '../services/images.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';

@Component({
  selector: 'app-gallery-thumbnail',
  templateUrl: './gallery-thumbnail.component.html',
  styleUrls: ['./gallery-thumbnail.component.scss']
})
export class GalleryThumbnailComponent implements OnInit {

  valdidate: boolean = false;
  istreated: boolean = false;
  totalItems: number;
  photosLoaded: boolean = false;
  closeResult: string;
  photos;
  selectedPhoto;
  private modalRef: NgbModalRef;
  private paginStart: number = 1;
  private paginEnd: number = 18;
  private nbItems: number = 17;
  refreshPhotos: boolean = false;

  constructor(private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private imagesService: ImagesService) {

  }

  ngOnInit() {
    this.getPhotos();
  }

  getExtraPhotos() {
    if (this.paginStart <= this.totalItems)
      this.getPhotos()
    else
      location.reload();
  }

  getPhotos() {
    this.spinner.show();
    this.imagesService.getPhotos({
      paginStart: this.paginStart,
      paginEnd: this.paginEnd
    }, { filtrePhotosTreated: "false" })
      .subscribe(
        (photos) => {
          this.photos = photos.Photos;
          this.totalItems = photos.totLines
        },
        (error) => console.log("getPhotoErr : ", error),
        () => {
          this.paginStart = this.paginEnd;
          this.paginEnd += this.nbItems;
          this.photosLoaded = true;
          this.spinner.hide();
          if (this.paginStart <= this.totalItems)
            this.refreshPhotos = false;
          else
            this.refreshPhotos = true;
        }
      )
  }

  open(content, photo) {
    this.selectedPhoto = photo;
    this.modalRef = this.modalService.open(content, { centered: true, windowClass: 'css-modal' })
  }

  private validatePhoto(cdPhoto, idValidateur, isValidated) {
    this.valdidate = isValidated;
    _.map(this.photos, (value) => {
      if (value.cdPhoto == cdPhoto) {
        value.isTreated = 'true';
        value.isValidated = isValidated;
      }
      return value
    });
    console.log(this.valdidate);
    this.imagesService.validatePhoto(cdPhoto, idValidateur, isValidated).subscribe(() => this.modalRef.close())
  }

}
