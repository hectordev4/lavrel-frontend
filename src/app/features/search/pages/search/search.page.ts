import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SearchSuggestions } from '../../data-access/search-suggestions';
import { SuggestionList } from '../../ui/suggestion-list/suggestion-list';

/** The Search tab: a search box with grouped suggestions as you type. */
@Component({
  selector: 'app-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SuggestionList],
  providers: [SearchSuggestions],
  templateUrl: './search.page.html',
  styleUrl: './search.page.scss',
})
export class SearchPage {
  private readonly router = inject(Router);
  protected readonly suggestions = inject(SearchSuggestions);
  protected readonly text = signal('');

  protected onInput(value: string): void {
    this.text.set(value);
    this.suggestions.type(value);
  }

  protected clear(input: HTMLInputElement): void {
    this.onInput('');
    input.value = '';
    input.focus();
  }

  protected submit(): void {
    const q = this.text().trim();
    if (q.length >= 2) void this.router.navigate(['/search/results'], { queryParams: { q } });
  }
}
