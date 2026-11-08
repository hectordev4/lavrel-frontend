import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { installDialogStandIn } from '../../../../../testing/dialog';
import { testProviders } from '../../../../../testing/test-env';
import { GuidePage } from './guide.page';

const settle = () => new Promise((resolve) => setTimeout(resolve));

async function render(query: Record<string, string>) {
  installDialogStandIn();
  TestBed.configureTestingModule({
    providers: testProviders({
      provide: ActivatedRoute,
      useValue: {
        snapshot: {
          paramMap: convertToParamMap({ gameId: '7', achievementId: '42' }),
          queryParamMap: convertToParamMap(query),
        },
      },
    }),
  });
  const fixture = TestBed.createComponent(GuidePage);
  fixture.detectChanges();
  TestBed.inject(HttpTestingController)
    .expectOne('/api/currentuser/assistant/usage')
    .flush({ usedToday: 2, dailyLimit: 20 });
  await settle();
  fixture.detectChanges();
  return fixture;
}

describe('GuidePage', () => {
  it('asks about spoilers first, then shows the answer and the follow-up line', async () => {
    const fixture = await render({
      name: 'Night Owl Run',
      game: 'Rogue Harbor',
      slug: 'rogue-harbor',
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Spoilers or no spoilers?');
    expect(el.querySelector('textarea')).toBeNull();

    ([...el.querySelectorAll('.option')][0] as HTMLButtonElement).click();
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.params.get('spoilers') === 'false')
      .flush({
        status: 'READY',
        text: 'Try the **east** door.',
        grounded: true,
        sources: [],
        saved: true,
        createdAt: null,
      });
    await settle();
    fixture.detectChanges();

    expect(el.querySelector('app-guide-answer strong')!.textContent).toBe('east');
    expect(el.textContent).toContain('Is there anything else I can help with?');
    expect(el.querySelector('textarea')).not.toBeNull();
    expect(el.textContent).toContain('18 of 20 new answers left today');
  });

  it('keeps a hidden achievement’s name out of the title until spoilers are chosen', async () => {
    const fixture = await render({ name: 'Behind the Waterfall', hidden: '1' });
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Hidden achievement');
  });
});
