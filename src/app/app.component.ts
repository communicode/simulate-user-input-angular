import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild('inputElement') inputElement: ElementRef;
  tasks = [];
  tasklimit = 10;
  pasteEnabled = false;

  public enter($event: KeyboardEvent): void {
    const target = $event.target as HTMLInputElement;
    const enteredText = target.value;

    this.addTask(enteredText);
  }

  public paste(event: ClipboardEvent): void {
    if (!this.pasteEnabled) {
      return;
    }

    const clipboardData = event.clipboardData;
    const pastedText = clipboardData.getData('text');

    this.addTask(pastedText);
  }

  public clearTaskList(): void {
    this.tasks = [];
  }

  public get taskCount(): number {
    return this.tasks.length;
  }

  public get taskHintCount(): number {
    return this.tasklimit - this.taskCount;
  }

  private addTask(value: string): void {
    const task = value.trim();

    if (!task.length) {
      return;
    }

    if (this.tasks.length < this.tasklimit) {
      this.tasks.push(task);
    }

    this.clearInput();
  }

  private clearInput(): void {
    setTimeout(() => {
      this.inputElement.nativeElement.value = '';
    }, 0);
  }
}
