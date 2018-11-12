import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ImagesService } from '../services/images.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { User } from '../shared/user';
import { TextService } from '../services/text.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-gallery-thumbnail',
  templateUrl: './gallery-thumbnail.component.html',
  styleUrls: ['./gallery-thumbnail.component.scss']
})
export class GalleryThumbnailComponent implements OnInit {
  qualifForm: FormGroup;
  invalidForm: FormGroup;
  qualifications;
  icon_Qualif_Color: string;
  noPhotos: boolean = false;
  idValidateur: string;
  valdidate: boolean = false;
  istreated: boolean = false;
  totalItems: number;
  photosLoaded: boolean = false;
  closeResult: string;
  currentUser: User;
  userChecked: boolean = false;
  photos;
  selectedPhoto;
  private modalRef: NgbModalRef;
  private currentPage: number = 1;
  private nbItems: number = 18;
  private previousPage: number = 1;
  helpText;
  validator = {
    photoSelect: false,
    grpSimpleSelect: false,
    grpTaxoSelect: false,
    especeSelect: false,
    userId: null,
    userRole: null,
    isValidator: false,
    validationFilter: false
  }
  constructor(private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private textService: TextService,
    private formBuilder: FormBuilder,
    private imagesService: ImagesService) {
  }

  ngOnInit() {
    this.getPhotos(this.currentPage, this.nbItems);
    this.imagesService.getQualifications()
      .subscribe(
        (data) => {
          this.qualifications = data.qualifications;
        });
    this.textService.getText(1).
      subscribe(
        (text) => {
          this.helpText = text;
        }
      )
  }

  loadPage(page: number) {
    let paginStart;
    let paginEnd;
    if (page !== this.previousPage) {
      if (page > 1)
        paginStart = this.nbItems * (page - 1) + 1;
      else
        paginStart = 1;
      this.previousPage = page;
      paginEnd = paginStart + this.nbItems - 1
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
        (error) => {
          this.noPhotos = true;
          this.spinner.hide();
          console.log("getPhotoErr : ", error)
        },
        () => {
          if (this.photos)
            this.noPhotos = false;
          _.map(this.photos, (photo) => {
            photo.icon_Qualif_Color = '#555'
          });
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

  openLargePhoto(largePhoto, photo) {
    this.selectedPhoto = photo;
    this.modalRef = this.modalService.open(largePhoto, { centered: true, windowClass: 'css-modal' })
  }

  public validatePhoto(isValidated, qualif) {
    this.imagesService.validatePhoto(this.selectedPhoto.cdPhoto, this.idValidateur, isValidated)
      .subscribe(
        () => {
          _.map(this.photos, (value) => {
            if (value.cdPhoto == this.selectedPhoto.cdPhoto) {
              value.isTreated = 'true';
              value.isValidated = isValidated;
            }
            return value
          });
        },
        (error) => console.log("validation_error", error),
        () => {
          this.setQualifications(qualif)
        }
      )
  }

  openHelp(helpModal) {
    this.modalService.open(helpModal, { centered: true, windowClass: 'help-modal' })
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

  public invalidPhoto(event, photo, modalInvalidPhoto) {
    this.selectedPhoto = photo;
    event.stopPropagation()
    this.invalidForm = this.formBuilder.group({
      qualif: [this.selectedPhoto.qualification],
    });
    this.modalRef = this.modalService.open(modalInvalidPhoto, { centered: true, windowClass: 'css-modal' })
  }

  public qualiferPhoto(event, photo, modalQualifPhoto) {
    this.selectedPhoto = photo;
    this.qualifForm = this.formBuilder.group({
      qualif: [this.selectedPhoto.qualification],
    });
    event.stopPropagation()
    this.modalRef = this.modalService.open(modalQualifPhoto, { centered: true, windowClass: 'css-modal' })

  }
  setQualifications(qualif) {
    this.imagesService.setQualifications(this.selectedPhoto.cdPhoto, qualif)
      .subscribe(
        () => {
          this.selectedPhoto.icon_Qualif_Color = 'gold';
          this.selectedPhoto.qualification = qualif;
          this.modalRef.close()
        },
        error => console.log("error set qualif", error)
      )
  }
  getCurrentUser(currentUser) {
    this.userChecked = true;
    if (currentUser) {
      this.validator.userId = currentUser.attributes.ID_UTILISATEUR;
      this.currentUser = currentUser
      this.idValidateur = (this.currentUser.attributes.ID_UTILISATEUR).toString();
      let roles = currentUser.attributes.GROUPS.split(",");
      if (_.includes(roles, 'IE_VALIDATOR_PHOTO')) {
        this.validator.photoSelect = true;
        this.validator.userRole = 'IE_VALIDATOR_PHOTO'
      }
      if (_.includes(roles, 'IE_VALIDATOR_GRSIMPLE')) {
        this.validator.grpSimpleSelect = true;
        this.validator.userRole = 'IE_VALIDATOR_GRSIMPLE'
      }
      if (_.includes(roles, 'IE_VALIDATOR_GROPE')) {
        this.validator.grpTaxoSelect = true;
        this.validator.userRole = 'IE_VALIDATOR_GROPE'
      }
      if (_.includes(roles, 'IE_VALIDATOR_EXPERT')) {
        this.validator.especeSelect = true;
        this.validator.userRole = 'IE_VALIDATOR_EXPERT'
      }
      if (_.includes(roles, 'IE_VALIDATOR_PHOTO') || _.includes(roles, 'IE_VALIDATOR_GRSIMPLE') ||
        _.includes(roles, 'IE_VALIDATOR_GROPE') || _.includes(roles, 'IE_VALIDATOR_EXPERT'))
        this.validator.isValidator = true;
    }

  }
}
