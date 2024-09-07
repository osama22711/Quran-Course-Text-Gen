import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { SubjectsState, CourseTimeInStringState } from 'src/store/app-state.service';

import { Clipboard } from '@capacitor/clipboard';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  messageToBeShared: string = '';
  subjectsChecklist: checklist[] = [];

  constructor(private subjectsState: SubjectsState, private courseTimeState: CourseTimeInStringState, private toastController: ToastController) {
  }
  
  ngOnInit(): void {
    this.subjectsState.getState().subscribe((internalSubjectState) => {
      if (internalSubjectState) {
        internalSubjectState.forEach(subject => {
          this.subjectsChecklist.push({ name: subject!.toString(), checked: false})
        });
      }
    });
    
    this.generateMessageToBeShared();
  }

  getSelectedSubjects() {
    return this.subjectsChecklist.filter(x => x.checked === true).map(x => x.name);
  }

  onCheckboxChange(subject: checklist) {
    subject.checked = !subject.checked;
    this.generateMessageToBeShared();
  }

  generateMessageToBeShared() {
    const subjects = this.getSelectedSubjects();
    
    let subjectText = '';
    if (subjects.length > 0) {
      let subjectsFormattedWithNumbering = '';
      subjects.forEach((subject, index) => {
        subjectsFormattedWithNumbering = subjectsFormattedWithNumbering.concat(`         ${index+1}- ${subject} \n`)
      });

      subjectText = `📗 يرجى احضار الكتب الآتية:
${subjectsFormattedWithNumbering}
      `
    }

    const courseTime = this.courseTimeState.getValue();

    const memorizationText = `${subjectText === '' ? 'يرجى تجهيز المحفوظات' : 'وتجهيز المحفوظات'}`

    this.messageToBeShared = `
🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴

السلام عليكم ورحمة الله وبركاته

اسعد الله اوقاتكم بكل خير 🎉

يتجدد لقائنا اليوم عند ${courseTime} باذن الله

${subjectText}${memorizationText}
    `

    this.messageToBeShared = this.messageToBeShared.trim();
  }

  async copyText() {
    await Clipboard.write({ string: this.messageToBeShared });
    const toast = await this.toastController.create({
      message: 'Text copied to clipboard!',
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }

  async shareText() {
    await Share.share({
      title: 'Share Text',
      text: this.messageToBeShared,
      dialogTitle: 'Share with',
    });
  }
}

export interface checklist {
  name: string,
  checked: boolean
}
