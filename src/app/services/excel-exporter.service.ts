import { Injectable } from '@angular/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Platform } from '@ionic/angular';
import { Student } from 'src/store/app-state.service';
import * as XLSX from 'xlsx';
import { Directory, Filesystem } from '@capacitor/filesystem';
import * as saveAs from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelExporterService {

  constructor(
    private platform: Platform,
    private fileOpener: FileOpener
  ) { }

  async exportStudentsDataToExcel(studentsData: Student[] | null) {
    if (!studentsData) return;

    let topMemorizer = null;
    let topAttendence = null;

    const dates: string[] = [];
    let topMemorizerCount = 0;
    let topAttendenceCount = 0;
    studentsData.forEach(person => {
      person.attendance.forEach(record => {
        if (!dates.includes(record.date)) {
          dates.push(record.date)
        }
      });

      const memorizeCount = person.memorization.reduce((count, record) => {
        if (record.hasParticipated) {
          return count + 1;
        }
        return count;
      }, 0);

      if (memorizeCount > topMemorizerCount) {
        topMemorizerCount = memorizeCount;
        topMemorizer = person.name;
      }

      const attendanceCount = person.attendance.reduce((count, record) => {
        if (record.hasParticipated) {
          return count + 1;
        }
        return count;
      }, 0);

      if (attendanceCount > topAttendenceCount) {
        topAttendenceCount = attendanceCount;
        topAttendence = person.name;
      }
    });

    const sortedDates = dates.sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());

    const sheetData: any[][] = [];

    const header = ['الأسم'];
    sortedDates.forEach(date => {
      header.push(date);
      header.push('');
    });
    sheetData.push(header);

    const subheader = [''];
    sortedDates.forEach(() => {
      subheader.push('الحضور');
      subheader.push('التسميع');
    })
    sheetData.push(subheader);

    studentsData.forEach(person => {
      const row = [person.name];

      sortedDates.forEach(date => {
        const attendanceRecord = person.attendance.find(record => record.date === date);
        const attendance = attendanceRecord ? `${attendanceRecord.hasParticipated ? 'نعم' : 'لا'}` : 'لا';

        const memorizationRecord = person.memorization.find(record => record.date === date);
        const memorization = memorizationRecord ? `${memorizationRecord.hasParticipated ? 'نعم' : 'لا'}` : 'لا';

        row.push(attendance);
        row.push(memorization);
      });

      sheetData.push(row);
    });

    sheetData.push([]);

    const courseDays = ['ايام الدورة'];
    courseDays.push(`${dates.length}`);
    sheetData.push(courseDays);

    const topMemorizerRow = ['اكثر تسميع'];
    topMemorizerRow.push(topMemorizer ? `${topMemorizer} سمع اكثر من ${topMemorizerCount}` : 'لا يوجد احد');
    sheetData.push(topMemorizerRow);

    const topAttendenceRow = ['اكثر حضور'];
    topAttendenceRow.push(topAttendence ? `${topAttendence} حضر اكثر من ${topAttendenceCount}` : 'لا يوجد احد');
    sheetData.push(topAttendenceRow);

    const serialMemorizationRow = ['تسميع متتالي'];
    const consecutiveMemorizer = this.getTopConsecutiveMemorizer(sortedDates, studentsData);
    serialMemorizationRow.push(`${consecutiveMemorizer?.name} سمع اكثر من ${consecutiveMemorizer.streak}`);
    sheetData.push(serialMemorizationRow);

    const serialAttendanceRow = ['حضور متتالي'];
    const consecutiveAttendence = this.getTopConsecutiveAttendence(sortedDates, studentsData);
    serialAttendanceRow.push(`${consecutiveMemorizer?.name} حضر اكثر من ${consecutiveMemorizer.streak}`);
    sheetData.push(serialAttendanceRow);

    await this.exportToExcel(sheetData, 'ملفات الطلاب');
  }

  private async exportToExcel(sheetData: any[][], fileName: string) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance and Memorization');

    const wbout: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const base64Data = this.arrayBufferToBase64(wbout);

    const fileNameWithExtension = `${fileName}.xlsx`;

    // If Platform is mobile
    if (this.platform.is('cordova')) {
      try {
        const savedFile = await Filesystem.writeFile({
          path: fileNameWithExtension,
          data: base64Data,
          directory: Directory.Data,
        });

        await this.fileOpener.open(savedFile.uri, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      } catch (error) {
        console.error('Error saving file', error);
      }
    } else {
      // Else Platform is browser
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, fileNameWithExtension);
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private getTopConsecutiveMemorizer(courseDays: string[], studentsData: Student[]): any {
    if (!studentsData) return null;

    let topMemorizer = null;
    let topMemorizerStreak = 0;

    studentsData.forEach(student => {
      let currentStreak = 0;

      for (let i = 0; i < courseDays.length; i++) {
        const participationDate = student.memorization.filter(x => x.date === courseDays[i]);
        if (participationDate.length > 0 && participationDate[0].hasParticipated) {
          currentStreak++;
          if (currentStreak > topMemorizerStreak) {
            topMemorizer = student.name;
            topMemorizerStreak = currentStreak;
          }
        }
      }
    });

    const returnedData = {
      name: topMemorizer,
      streak: topMemorizerStreak
    }

    return returnedData;
  }

  private getTopConsecutiveAttendence(courseDays: string[], studentsData: Student[]): any {
    if (!studentsData) return null;

    let topAttendence = null;
    let topAttendenceStreak = 0;

    studentsData.forEach(student => {
      let currentStreak = 0;

      for (let i = 0; i < courseDays.length; i++) {
        const participationDate = student.attendance.filter(x => x.date === courseDays[i]);
        if (participationDate.length > 0 && participationDate[0].hasParticipated) {
          currentStreak++;
          if (currentStreak > topAttendenceStreak) {
            topAttendence = student.name;
            topAttendenceStreak = currentStreak;
          }
        }
      }
    });

    const returnedData = {
      name: topAttendence,
      streak: topAttendenceStreak
    }

    return returnedData;
  }
}
