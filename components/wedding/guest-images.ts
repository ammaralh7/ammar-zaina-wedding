// Microsoft Fluent Emoji (MIT), served from jsDelivr.
const BASE = "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets";

function emoji(folder: string, file: string) {
  return `${BASE}/${encodeURIComponent(folder)}/Default/3D/${file}_3d_default.png`;
}

// One figure per person in the party, in the order they appear.
export const partyImages = [
  emoji("Man", "man"),
  emoji("Woman with headscarf", "woman_with_headscarf"),
  emoji("Girl", "girl"),
  emoji("Boy", "boy"),
  emoji("Old woman", "old_woman"),
  emoji("Old man", "old_man"),
  emoji("Woman", "woman"),
  emoji("Man beard", "man_beard"),
  emoji("Person", "person"),
  emoji("Baby", "baby"),
];

export const groomImage = emoji("Man in tuxedo", "man_in_tuxedo");
export const brideImage = emoji("Woman with veil", "woman_with_veil");
