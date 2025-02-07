import { fakeAsync } from '@angular/core/testing';

import { createService, runLoader } from '../mocks';
import { TranslocoService } from '../../transloco.service';

describe('missingHandler', () => {
  describe('missingHandler.allowEmpty', () => {
    it('should not call handle', () => {
      const service = createService({
        missingHandler: { allowEmpty: true },
      });
      service.setTranslation(
        {
          empty: '',
        },
        'en',
      );

      spyOn((service as any).missingHandler, 'handle').and.callThrough();
      const value = service.translate('empty');

      expect(value).toEqual('');
      expect((service as any).missingHandler.handle).not.toHaveBeenCalled();
    });
  });

  describe('missingHandler.useFallbackTranslation', () => {
    let service: TranslocoService;
    beforeEach(() => {
      service = createService({
        fallbackLang: 'es',
        missingHandler: {
          useFallbackTranslation: true,
        },
      });
    });

    it('should load the active and the fallback lang', fakeAsync(() => {
      const loaderSpy = spyOn(
        (service as any).loader,
        'getTranslation',
      ).and.callThrough();
      service.load('en').subscribe();
      runLoader();
      expect(loaderSpy).toHaveBeenCalledTimes(2);
      expect(loaderSpy.calls.allArgs()).toEqual([
        ['en', undefined],
        ['es', undefined],
      ]);
    }));

    it('should get the translation from the fallback when there is no key', fakeAsync(() => {
      spyOn((service as any).loader, 'getTranslation').and.callThrough();
      service.load('en').subscribe();
      runLoader(2000);
      const result = service.translate('fallback');
      expect(result).toEqual("I'm a spanish fallback");
    }));

    it('should get the translation from the fallback when the value is empty', fakeAsync(() => {
      spyOn((service as any).loader, 'getTranslation').and.callThrough();
      service.load('en').subscribe();
      runLoader(2000);
      expect(service.translate('empty', { value: 'hello' })).toEqual(
        "I'm a spanish empty fallback hello",
      );
    }));

    it('should load the scope fallback when working with scopes', fakeAsync(() => {
      const loaderSpy = spyOn(
        (service as any).loader,
        'getTranslation',
      ).and.callThrough();
      service.load('lazy-page/en').subscribe();
      runLoader(2000);
      expect(loaderSpy.calls.allArgs()).toEqual([
        ['lazy-page/en', { scope: 'lazy-page' }],
        ['lazy-page/es', { scope: 'lazy-page' }],
      ]);
      expect(service.translate('empty', {}, 'lazy-page/en')).toEqual(
        'resolved from es',
      );
    }));

    it('should respect allow empty', fakeAsync(() => {
      service.config.missingHandler.allowEmpty = true;
      spyOn((service as any).loader, 'getTranslation').and.callThrough();
      service.load('en').subscribe();
      runLoader(2000);
      expect(service.translate('empty', { value: 'hello' })).toEqual('');
    }));
  });
});
