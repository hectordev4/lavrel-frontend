/** Who sees what on the public profile. Everything is off until the member turns it on. */
export interface ProfileSettings {
  public: boolean;
  showCountry: boolean;
  showPlatforms: boolean;
  showAvatar: boolean;
  /** How many games you own, on the STATS shelf. */
  showLibrarySize?: boolean;
}
