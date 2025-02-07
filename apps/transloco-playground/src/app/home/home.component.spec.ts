import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { TranslocoService } from '@jsverse/transloco';

import { getTranslocoModule } from '../transloco-testing.module';

import { HomeComponent } from './home.component';

describe('OnPushComponent', () => {
  let spectator: Spectator<HomeComponent>;
  const createComponent = createComponentFactory({
    component: HomeComponent,
    imports: [
      getTranslocoModule({
        translocoConfig: { reRenderOnLangChange: true },
      }),
    ],
  });

  beforeEach(() => (spectator = createComponent()));

  it('should translate', () => {
    expect(spectator.query('.structural [data-cy=regular]')).toHaveText(
      'Regular: home spanish',
    );
    expect(spectator.query('.structural [data-cy=current-lang]')).toHaveText(
      'Current Lang: es',
    );
    expect(spectator.query('.pipe [data-cy=p-regular]')).toHaveText(
      'Regular: home spanish',
    );
    expect(spectator.query('.pipe [data-cy=p-regular]')).toHaveText(
      'Regular: home spanish',
    );
    const service = spectator.inject(TranslocoService);
    service.setActiveLang('en');
    spectator.detectChanges();
    expect(spectator.query('.structural [data-cy=regular]')).toHaveText(
      'Regular: home english',
    );
    expect(spectator.query('.structural [data-cy=current-lang]')).toHaveText(
      'Current Lang: en',
    );
    expect(spectator.query('.pipe [data-cy=p-regular]')).toHaveText(
      'Regular: home english',
    );
  });
});
