import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-env';
import { PlayersApi } from './players.api';

describe('PlayersApi', () => {
  it('loads a public profile by public id', () => {
    TestBed.configureTestingModule({ providers: testProviders() });
    TestBed.inject(PlayersApi).profile('4829103755210846').subscribe();
    TestBed.inject(HttpTestingController).expectOne('/api/users/4829103755210846').flush({});
  });
});
