import { Component, OnInit } from '@angular/core';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { CourseTimeInStringState, Participated, StudentsState, SubjectsState } from 'src/store/app-state.service';
import { IonInput, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-summary-tab',
  templateUrl: 'summary-tab.page.html',
  styleUrls: ['summary-tab.page.scss']
})
export class SummaryTab implements OnInit {
  messageToBeShared: string = '';
  subjectsChecklist: checklist[] = [];
  attendeesChecklist: checklist[] = [];
  memorizersChecklist: checklist[] = [];

  constructor(private subjectsState: SubjectsState, private courseTimeState: CourseTimeInStringState, private studentsState: StudentsState, private toastController: ToastController) {
  }

  ngOnInit(): void {
    this.subjectsState.getState().subscribe((internalSubjectState) => {
      this.subjectsChecklist = [];

      if (internalSubjectState) {
        internalSubjectState.forEach(subject => {
          this.subjectsChecklist.push({ name: subject!.toString(), descriptions: [], checked: false })
        });
      }
    });

    this.studentsState.getState().subscribe((internalStudentsState) => {
      this.attendeesChecklist = [];
      this.memorizersChecklist = [];

      if (internalStudentsState) {
        internalStudentsState.forEach(student => {
          const todaysDate = new Date().toLocaleDateString();
          const todaysDateParticipation = student?.attendance?.find(x => x.date === todaysDate);
          const todaysDateMemorization = student?.memorization?.find(x => x.date === todaysDate);

          this.attendeesChecklist.push({ name: student.name, checked: todaysDateParticipation ? todaysDateParticipation.hasParticipated : false })
          this.memorizersChecklist.push({ name: student.name, checked: todaysDateMemorization ? todaysDateMemorization.hasParticipated : false })
        });
      }
    });

    this.generateMessageToBeShared();
  }

  getSelectedSubjects() {
    return this.subjectsChecklist.filter(x => x.checked === true);
  }

  getSelectedAttendees() {
    return this.attendeesChecklist.filter(x => x.checked === true).map(x => x.name);
  }

  getSelectedMemorizers() {
    return this.memorizersChecklist.filter(x => x.checked === true).map(x => x.name);
  }

  onSubjectCheckboxChange(subject: checklist) {
    subject.checked = !subject.checked;
    subject.descriptions = subject.descriptions!.length > 0 ? subject.descriptions : [''];
    this.generateMessageToBeShared();
  }

  onAttendeeCheckboxChange(attendee: checklist) {
    attendee.checked = !attendee.checked;

    const previousState = this.studentsState.getValue();
    const todaysDate = new Date().toLocaleDateString();
    const participated: Participated = {
      date: todaysDate,
      hasParticipated: attendee.checked
    }
    const student = previousState?.find(x => x.name === attendee.name);
    const todaysDateParticipation = student?.attendance?.find(x => x.date === todaysDate);

    if (todaysDateParticipation) {
      todaysDateParticipation!.hasParticipated = attendee.checked;
      previousState!.find(x => x.name === attendee.name)!.attendance = student!.attendance;
    } else {
      previousState?.filter(x => x.name == attendee.name)[0].attendance.push(participated);
    }

    this.studentsState.setState(previousState);

    this.generateMessageToBeShared();
  }

  onMemorizerCheckboxChange(memorizer: checklist) {
    memorizer.checked = !memorizer.checked;

    const previousState = this.studentsState.getValue();
    const todaysDate = new Date().toLocaleDateString();
    const participated: Participated = {
      date: todaysDate,
      hasParticipated: memorizer.checked
    }
    const student = previousState?.find(x => x.name === memorizer.name);
    const todaysDateParticipation = student?.memorization?.find(x => x.date === todaysDate);

    if (todaysDateParticipation) {
      todaysDateParticipation!.hasParticipated = memorizer.checked;
      previousState!.find(x => x.name === memorizer.name)!.memorization = student!.memorization;
    } else {
      previousState?.filter(x => x.name == memorizer.name)[0].memorization?.push(participated);
    }

    this.studentsState.setState(previousState);
    this.generateMessageToBeShared();
  }

  handleSubjectDescriptionButtonClick(subject: checklist, inputElement: IonInput) {
    const value = inputElement?.value as string;
    if (!value.trim()) return;

    if (subject.descriptions!.length === 1 && !subject.descriptions![0].trim()) {
      subject.descriptions![0] = value;
    } else {
      subject.descriptions!.push(value)
    }

    inputElement.value = null;

    this.generateMessageToBeShared();
  }

  generateMessageToBeShared() {
    const subjects = this.getSelectedSubjects();

    let subjectText = '';
    if (subjects.length > 0) {
      let subjectsFormattedWithNumbering = '';
      subjects.forEach((subject, index) => {
        subjectsFormattedWithNumbering = subjectsFormattedWithNumbering.concat(`         ${index + 1}- ${subject.name} \n`)
        subject.descriptions?.forEach((description) => {
          subjectsFormattedWithNumbering = subjectsFormattedWithNumbering.concat(`           ● ${description} \n`)
        });
      });

      subjectText = `📗 الدروس المعطاة اليوم:
${subjectsFormattedWithNumbering}
      `
    }


    const memorizers = this.getSelectedMemorizers();

    let memorizersText = '';
    if (memorizers.length > 0) {
      let memorizersFormattedWithNumbering = '';
      memorizers.forEach((memorizer, index) => {
        memorizersFormattedWithNumbering = memorizersFormattedWithNumbering.concat(`         ${index + 1}- ${memorizer} \n`)
      });

      memorizersText = `🟢 مع التسميع, سمع كل من:
${memorizersFormattedWithNumbering}
      `
    } else {
      memorizersText = `🔴 اليوم لا يوجد تسميع لضيق الوقت`;
    }

    const attendees = this.getSelectedAttendees();

    let attendeesText = '';
    if (attendees.length > 0) {
      let attendeesFormattedWithNumbering = '';
      attendees.forEach((attendee, index) => {
        attendeesFormattedWithNumbering = attendeesFormattedWithNumbering.concat(`         ${index + 1}- ${attendee} \n`)
      });

      attendeesText = `📒 الحضور:
${attendeesFormattedWithNumbering}
      `
    }

    this.messageToBeShared = `
🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡

السلام عليكم ورحمة الله وبركاته

اسعد الله اوقاتكم بكل خير 🎉


${subjectText}

${memorizersText}

---------------------------------------------------------
${attendeesText}
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
  checked: boolean,
  descriptions?: Array<string>
}