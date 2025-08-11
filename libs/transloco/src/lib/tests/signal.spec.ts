import { Component, signal } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { TranslocoModule } from '../transloco.module';
import { translateSignal, translateObjectSignal } from '../transloco.signal';

import { providersMock, runLoader } from './mocks';

@Component({
  imports: [TranslocoModule],
  template: `
    <div id="text">{{ translatedText() }}</div>
    <div id="textObject">{{ translatedObject().title }}</div>
    <div id="dynamicKey">{{ translatedDynamicKey() }}</div>
    <div id="dynamicParam">{{ translatedDynamicParam() }}</div>
  `,
})
class TestComponent {
  translatedText = translateSignal('home');
  translatedObject = translateObjectSignal('nested');

  dynamicKey = signal('home');
  dynamicParam = signal('Signal');

  translatedDynamicKey = translateSignal(this.dynamicKey);
  translatedDynamicParam = translateSignal('alert', {
    value: this.dynamicParam,
  });

  translatedObjectDynamicKey = translateObjectSignal(this.dynamicKey);
  translatedObjectDynamicParam = translateObjectSignal(
    this.dynamicKey,
    this.dynamicParam,
  );

  changeKey(key: string) {
    this.dynamicKey.set(key);
  }

  changeParam(param: any) {
    this.dynamicParam.set(param);
  }
}

describe('translateSignal in component', () => {
  let spectator: Spectator<TestComponent>;
  const createComponent = createComponentFactory({
    component: TestComponent,
    imports: [TranslocoModule],
    providers: providersMock,
  });

  it('should translate a static key', fakeAsync(() => {
    spectator = createComponent();
    runLoader();
    spectator.detectChanges();
    expect(spectator.query('#text')).toHaveText('home english');
  }));

  it('should translate a dynamic key', fakeAsync(() => {
    spectator = createComponent();
    runLoader();
    spectator.detectChanges();
    spectator.component.changeKey('fromList');
    spectator.detectChanges();
    expect(spectator.query('#dynamicKey')).toHaveText('from list');
  }));

  it('should translate with params', fakeAsync(() => {
    spectator = createComponent();
    runLoader();
    spectator.detectChanges();
    spectator.component.changeParam('Signal Changed');
    spectator.detectChanges();
    expect(spectator.query('#dynamicParam')).toHaveText(
      'alert Signal Changed english',
    );
  }));
});

describe('translateObjectSignal in component', () => {
  let spectator: Spectator<TestComponent>;
  const createComponent = createComponentFactory({
    component: TestComponent,
    imports: [TranslocoModule],
    providers: providersMock,
  });

  it('should translate a static key to an object', fakeAsync(() => {
    spectator = createComponent();
    runLoader();
    spectator.detectChanges();
    expect(spectator.query('#textObject')).toHaveText('Title english');
  }));

  it('should translate a dynamic key to an object', fakeAsync(() => {
    spectator = createComponent();
    runLoader();
    spectator.detectChanges();
    spectator.component.changeKey('key.is.like');
    spectator.detectChanges();
    expect(spectator.component.translatedObjectDynamicKey()).toEqual({
      path: 'key is like path',
    });
  }));

  it('should translate with params to an object', fakeAsync(() => {
    spectator = createComponent();
    runLoader();
    spectator.detectChanges();
    spectator.component.changeKey('a.b');
    spectator.component.changeParam({ c: { fromList: 'Signal Changed' } });
    spectator.detectChanges();
    console.log(spectator.component.translatedObjectDynamicParam());
    expect(spectator.component.translatedObjectDynamicParam()).toEqual({
      c: 'a.b.c Signal Changed english',
    });
  }));
});
