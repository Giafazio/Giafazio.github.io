import gamesTitleTile from
  "../assets/navigation/tiles/maio1_8.png";

import portfolioTitleTile from
  "../assets/navigation/tiles/maio1_9.png";

import poetryTitleTile from
  "../assets/navigation/tiles/maio1_6.png";

import agroxelTitleTile from
  "../assets/navigation/tiles/maio1_2.png";

import quelloTondoTitleTile from
  "../assets/navigation/tiles/maio1_1.png";

import quantumTransportTitleTile from
  "../assets/navigation/tiles/maio2_1.png";

import vaccaseTitleTile from
  "../assets/navigation/tiles/maio2_2.png";

import caragiuloriginTitleTile from
  "../assets/navigation/tiles/maio2_3.png";

import fumettonziTitleTile from
  "../assets/navigation/tiles/maio1_5.png";

const projectTitleTiles:
  Record<string, string> = {
    "games-and-riddles":
      gamesTitleTile.src,

    "esperimenti-di-portafoglio":
      portfolioTitleTile.src,

    "poetry-collection":
      poetryTitleTile.src,

    "agroxel":
      agroxelTitleTile.src,

    "quellotondo":
      quelloTondoTitleTile.src,
    
    "quantum-transport-rg":
      quantumTransportTitleTile.src,

    "vaccase":
      vaccaseTitleTile.src,

    "caragiulorigin":
      caragiuloriginTitleTile.src,

    "fumettonzi":
      fumettonziTitleTile.src,
  };

export function getProjectTileStyle(
  projectId: string,
): string {
  const tile =
    projectTitleTiles[projectId] ??
    gamesTitleTile.src;

  return (
    `--project-title-tile: ` +
    `url("${tile}")`
  );
}