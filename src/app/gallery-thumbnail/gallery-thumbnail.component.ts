import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ImagesService } from '../services/images.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';

import { User } from '../user';
import { GalleryGuard } from '../services/gallery-guard.service';

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
  currentUser: User;
  photos;
  selectedPhoto;
  private modalRef: NgbModalRef;
  private cuurentPage: number = 1;
  private nbItems: number = 17;
  private previousPage: number = 1;

  constructor(private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private authGuard: GalleryGuard,
    private imagesService: ImagesService) {

  }

  ngOnInit() {
    this.currentUser = this.authGuard.userProfile;
    console.log("this.currentUser",this.currentUser);
    
    this.idValidateur = (this.currentUser.attributes.ID_UTILISATEUR).toString();
    this.getPhotos(this.cuurentPage, this.nbItems + 1);
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

  private validatePhoto(cdPhoto, idValidateur, isValidated) {
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

}
