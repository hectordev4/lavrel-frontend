import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AvatarApi } from '../../../../core/api/avatar.api';
import { ProfileAvatar } from '../../../../core/api/models/profile-avatar.model';
import { MyAvatar } from '../../../../core/profile/my-avatar';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { Segmented } from '../../../../shared/ui/segmented/segmented';

type Source = 'GENERATED' | 'GALLERY' | 'UPLOADED';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif'];
/** The backend's limits: 2 MB, and 1 MB for GIFs (it also wants GIFs at most 512×512). */
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_GIF_BYTES = 1024 * 1024;

/** The avatar sheet's content: generated, gallery or upload, with a live preview and Save. */
@Component({
  selector: 'app-avatar-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Segmented, Avatar],
  templateUrl: './avatar-picker.html',
  styleUrl: './avatar-picker.scss',
})
export class AvatarPicker {
  protected readonly me = inject(MyAvatar);
  private readonly api = inject(AvatarApi);
  readonly done = output<void>();

  protected readonly source = signal<Source>(this.me.avatar()?.kind ?? 'GENERATED');
  protected readonly galleryIds = signal<string[]>([]);
  protected readonly galleryChoice = signal<string | null>(this.me.avatar()?.galleryId ?? null);
  protected readonly file = signal<File | null>(null);
  protected readonly filePreview = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);

  protected readonly sources: { value: Source; label: string }[] = [
    { value: 'GENERATED', label: 'Generated' },
    { value: 'GALLERY', label: 'Gallery' },
    { value: 'UPLOADED', label: 'Upload' },
  ];

  /** What the preview shows for the current choice. */
  protected readonly preview = computed<ProfileAvatar>(() => {
    switch (this.source()) {
      case 'GALLERY':
        return { kind: 'GALLERY', galleryId: this.galleryChoice(), imageUrl: null };
      case 'UPLOADED':
        return {
          kind: 'UPLOADED',
          galleryId: null,
          imageUrl: this.filePreview() ?? this.me.avatar()?.imageUrl ?? null,
        };
      default:
        return { kind: 'GENERATED', galleryId: null, imageUrl: null };
    }
  });
  protected readonly canSave = computed(() => {
    if (this.saving()) return false;
    if (this.source() === 'GALLERY') return this.galleryChoice() !== null;
    if (this.source() === 'UPLOADED') return this.file() !== null;
    return true;
  });

  constructor() {
    void firstValueFrom(this.api.galleryIds())
      .then((ids) => this.galleryIds.set(ids))
      .catch(() =>
        this.error.set(
          'The gallery didn’t load. You can still use the generated avatar or upload one.',
        ),
      );
    inject(DestroyRef).onDestroy(() => this.revokePreview());
  }

  protected onFile(input: HTMLInputElement): void {
    const file = input.files?.[0] ?? null;
    this.error.set(null);
    if (file && !ACCEPTED.includes(file.type)) {
      this.error.set('Choose a JPG, PNG or GIF.');
      input.value = '';
      return;
    }
    if (file && file.size > (file.type === 'image/gif' ? MAX_GIF_BYTES : MAX_BYTES)) {
      this.error.set(
        file.type === 'image/gif' ? 'GIFs can be up to 1 MB.' : 'Pictures can be up to 2 MB.',
      );
      input.value = '';
      return;
    }
    this.revokePreview();
    this.file.set(file);
    this.filePreview.set(file ? URL.createObjectURL(file) : null);
  }

  protected async save(): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    const source = this.source();
    const error =
      source === 'GALLERY'
        ? await this.me.chooseGallery(this.galleryChoice()!)
        : source === 'UPLOADED'
          ? await this.me.upload(this.file()!)
          : await this.me.useGenerated();
    this.saving.set(false);
    if (error) this.error.set(error);
    else this.done.emit();
  }

  private revokePreview(): void {
    const url = this.filePreview();
    if (url) URL.revokeObjectURL(url);
  }
}
