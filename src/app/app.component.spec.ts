import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {DebugElement} from '@angular/core';
import {BrowserModule, By} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';

describe('AppComponent', () => {
  let fixture;
  let app: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [BrowserModule, FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance as AppComponent;
    fixture.detectChanges();
  });

  afterEach(() => {
    app.clearTaskList();
  });

  it('should add a task after pressing enter', () => {
    const taskText = 'Task 1';

    addTaskByEnter(fixture, taskText);

    // we need to query the tasklist after the first task was added because this
    // element is only rendered with tasks
    const tasklist = findElement(fixture, '[data-test-tasklist]');
    expect(tasklist.nativeElement.textContent).toEqual(taskText);
  });

  it('should add a task using paste only if enabled', () => {
    app.pasteEnabled = true;
    addTaskByPaste(fixture, 'Task 1');

    const tasklist = findElement(fixture, '[data-test-tasklist]');
    expect(tasklist.children.length).toEqual(1);

    app.pasteEnabled = false;
    addTaskByPaste(fixture, 'Task 2');
    expect(tasklist.children.length).toEqual(1);
  });

  it('should update the task headline correctly', () => {
    const headline = findElement(fixture, '[data-test-task-headline]');

    // initial value
    expect(headline.nativeElement.textContent).toEqual('Tasks');

    addTaskByEnter(fixture, 'Task 1');
    expect(headline.nativeElement.textContent).toEqual('1 Task');

    // ensure pluralisation works properly
    addTaskByEnter(fixture, 'Task 2');
    expect(headline.nativeElement.textContent).toEqual('2 Tasks');
  });

  it('should ignore whitespace only tasks', () => {
    addTaskByEnter(fixture, '    ');
    const tasklist = findElement(fixture, '[data-test-tasklist]');
    expect(tasklist).toBeNull();
  });

  it('should not add a task after the task limit is reached', () => {
    app.tasklimit = 1;

    addTaskByEnter(fixture, 'Task 1');
    addTaskByEnter(fixture, 'Task 2'); // shouldn't be added

    const tasklist = findElement(fixture, '[data-test-tasklist]');
    expect(tasklist.children.length).toEqual(1);
  });

  it('should disable the textbox after the limit was reached', () => {
    const element = findElement(fixture, '[data-test-taskbox]');
    const input = element.nativeElement as HTMLInputElement;

    app.tasklimit = 1;
    addTaskByEnter(fixture, 'Task 1');

    expect(input.disabled).toEqual(true);
  });

  it('should update the task hint properly', () => {
    const taskhint = findElement(fixture, '[data-test-task-hint]');
    app.tasklimit = 3;

    addTaskByEnter(fixture, 'Task 1');
    expect(taskhint.nativeElement.textContent).toEqual('You can add up to 2 tasks');

    addTaskByEnter(fixture, 'Task 2');
    expect(taskhint.nativeElement.textContent).toEqual('You can add up to 1 task');

    addTaskByEnter(fixture, 'Task 3');
    expect(taskhint.nativeElement.textContent).toEqual('No tasks left');
  });

  it('should clear the textbox after a task was added using enter-key', fakeAsync(() => {
    addTaskByEnter(fixture, 'Task 1');

    tick(1);
    const element = findElement(fixture, '[data-test-taskbox]');
    const input = element.nativeElement as HTMLInputElement;
    expect(input.value).toEqual('');
  }));

  it('should clear the textbox after a task was added using paste', fakeAsync(() => {
    app.pasteEnabled = false;
    addTaskByPaste(fixture, 'Task 1');

    tick(1);
    const element = findElement(fixture, '[data-test-taskbox]');
    const input = element.nativeElement as HTMLInputElement;
    expect(input.value).toEqual('');
  }));

});

// Keydown event is triggered using triggerEventHandler()
function addTaskByEnter(fixture, text): void {
  const element = findElement(fixture, '[data-test-taskbox]');
  const input = element.nativeElement as HTMLInputElement;

  input.value = text;
  element.triggerEventHandler('keydown.enter', {target: input});
  fixture.detectChanges();
}

// Paste event is triggered using native APIs
function addTaskByPaste(fixture, text): void {
  const element = findElement(fixture, '[data-test-taskbox]');
  const input = element.nativeElement as HTMLInputElement;
  const clipboardEvent: Event = new Event('paste', {});
  // @ts-ignore
  clipboardEvent.clipboardData = {
    getData: () => text,
  };
  input.dispatchEvent(clipboardEvent);
  fixture.detectChanges();
}

function getTaskbox() {}

function findElement<T>(
  fixture: ComponentFixture<T>,
  selector: string
): DebugElement {
  return fixture.debugElement.query(By.css(selector));
}
