import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { SubjectsState, CourseTimeInStringState } from 'src/store/app-state.service';

import { Clipboard } from '@capacitor/clipboard';
import { Share } from '@capacitor/share';
import { first, Observable } from 'rxjs';

@Component({
  selector: 'app-reminder-tab',
  templateUrl: 'reminder-tab.page.html',
  styleUrls: ['reminder-tab.page.scss']
})
export class ReminderTab implements OnInit {
  messageToBeShared: string = '';
  subjectsChecklist: checklist[] = [];
  courseTime: string = '';

  constructor(
    private subjectsState: SubjectsState,
    private courseTimeState: CourseTimeInStringState,
    private toastController: ToastController
  ) { }

  ngOnInit(): void {
    this.subjectsState.getState().subscribe((internalSubjectState) => {
      this.subjectsChecklist = [];

      if (internalSubjectState) {
        internalSubjectState.forEach(subject => {
          this.subjectsChecklist.push({ name: subject!.toString(), checked: false })
        });
      }

      this.generateMessageToBeShared();
    });

    this.courseTimeState.getState().subscribe((courseTime: string) => {
      this.courseTime = ''

      if (courseTime) {
        this.courseTime = courseTime;
      }

      this.generateMessageToBeShared();
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
        subjectsFormattedWithNumbering = subjectsFormattedWithNumbering.concat(`         ${index + 1}- ${subject} \n`)
      });

      subjectText = `📗 يرجى احضار الكتب الآتية:
${subjectsFormattedWithNumbering}
      `
    }

    const proposition = this.defineProposition(this.courseTime);
    const courseTime = proposition ? `${proposition} ${this.courseTime}` : this.courseTime;

    const memorizationText = `${subjectText === '' ? 'يرجى تجهيز المحفوظات' : 'وتجهيز المحفوظات'}`

    this.messageToBeShared = `
🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴

السلام عليكم ورحمة الله وبركاته

اسعد الله اوقاتكم بكل خير 🎉

يتجدد لقائنا اليوم ${courseTime} باذن الله

${subjectText}${memorizationText}
    `

    this.messageToBeShared = this.messageToBeShared.trim();
  }

  defineProposition(courseTime: string) {
    let proposition = 'عند';
    const firstWord = courseTime.split(' ')[0];

    if (firstWord === 'صلاة') {
      proposition = 'من';
    } else if (firstWord === 'من' || firstWord === 'عند') {
      return null;
    }

    return proposition;
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
