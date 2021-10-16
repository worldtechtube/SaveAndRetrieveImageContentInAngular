import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subscriber } from 'rxjs';

interface Wallpaper {
  id: number,
  wallpaperContent: Uint8Array[];
}

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css']
})

export class FileuploadComponent implements OnInit {

  image = new Array<string>(4);
  selectedFile: File[];
  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  onFileSelected(event){
    this.selectedFile=<File[]>event.target.files;
  }

  onUpload(){
    const filedata=new FormData();
    for(var i=0; i<this.selectedFile.length; i++){
      filedata.append('image', this.selectedFile[i], this.selectedFile[i].name);
    }
    this.http.post('https://localhost:44323/api/Files', filedata)
    .subscribe(res=>{
      console.log(res);
    })
  }


  setSingleImage(wallpaperId: number) {
    const headers = new HttpHeaders();
    this.http.get('https://localhost:44323/api/Files?id='+wallpaperId,{headers,  responseType: 'blob'} )
      .subscribe((data: Blob) =>{
        const observable = new Observable((subscriber: Subscriber<any>) => {
        const reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onloadend = function(){
          subscriber.next(reader.result);
          subscriber.complete();
        }        
      });

      observable.subscribe(d=>{
        this.image[3] = d;
      });      
    });
  }
  
  setImage() {
    this.http.get('https://localhost:44323/api/Files').subscribe((data: Wallpaper[])  => {
        data.forEach((wp, index) => {
          this.image[index] = 
          this.sanitizer.sanitize(SecurityContext.NONE, 
            this.sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64, ' + wp.wallpaperContent));
        });       
    });
  }
}
