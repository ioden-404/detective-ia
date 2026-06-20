Ce repo est l'espace de travail d'un assistant exécutif.

**.claude/skills/** : les skills Claude Code. Une skill = un sous-dossier contenant un fichier SKILL.md. Le harness charge automatiquement chaque description, pas besoin de les lister ici. Pour créer une skill, utiliser le plugin /skill-creator.

**context/** : la mémoire de travail persistante.

- context/me.md : identité de l'utilisateur, role, structure, langues, timezone, sources de revenus, objectifs, terminologie perso.

- context/connectors.md : registre des connecteurs (MCP, CLI) mis en place. Seuls ceux listés ici sont a utiliser. Tout nouveau connecteur doit y etre enregistre.

**projects/** : les chantiers actifs, un sous-dossier par projet.

---

## Génération d'images – Detective IA

### Style visuel cible
- Style **illustration graphique flat** – pas de réalisme photographique
- Palette réduite : tons sépia, beige kraft, brun sombre, rouge sang (#8B0000), noir
- Trait simple et net, pas de détails complexes
- Ambiance années 40-50, style affiche de film noir américain
- Pas de visages réalistes (source de bugs) – silhouettes ou portraits stylisés

### Règles strictes pour chaque prompt image

#### ✅ Toujours inclure
- Le style en premier : "flat illustration, film noir style, sepia tones, 1940s"
- La simplicité : "simple shapes, minimal details, clean lines"
- Le format : "portrait format, mobile screen ratio"
- La palette : "sepia, dark brown, beige, deep red, black and white"

#### ❌ Ne jamais demander
- Visages réalistes ou détaillés → utiliser silhouettes ou portraits très stylisés
- Scènes complexes avec beaucoup de personnages
- Textures hyper-réalistes (sang, blessures, etc.)
- Mains (source de bugs constants)
- Texte dans l'image (illisible et bugué)

### Templates de prompts par type d'image

#### Portrait suspect
```
flat illustration, film noir style, 1940s, portrait of [description générale : homme/femme, âge approximatif, trait distinctif simple],
simple shapes, minimal facial details, strong shadows, sepia tones, dark background,
noir detective game character card, no hands visible, bust shot only
```

#### Scène de crime
```
flat illustration, film noir style, 1940s, crime scene at [lieu simple],
viewed from above or wide angle, minimal details, yellow police tape,
sepia and dark tones, no bodies visible, symbolic and graphic,
simple shapes, clean composition
```

#### Preuve / Objet
```
flat illustration, film noir style, isolated object on dark background,
[nom de l'objet] as evidence, simple iconic shape, sepia tones,
dramatic single light source, no text, clean silhouette
```

#### Texture de fond
```
flat texture, [bois sombre / papier kraft / béton],
seamless pattern, minimal grain, muted colors,
no details, abstract, suitable as UI background
```

### Cohérence entre images
- Utiliser le même style descriptor au début de CHAQUE prompt
- Générer d'abord une image test avant de faire toute la série
- Si une image est incohérente → régénérer avec "more graphic, less realistic, simpler"

### En cas de bug visuel
Si l'image générée contient des bugs (visage déformé, membres bizarres, texte illisible) :
1. Ne pas utiliser l'image
2. Simplifier encore le prompt
3. Ajouter "vector art style, very simple, iconic" au prompt
4. En dernier recours : utiliser des emojis SVG ou des icônes CSS à la place

### Priorité des images à générer (dans l'ordre)
1. Textures de fond (bois, papier) → le plus simple, le moins de risques de bugs
2. Images des preuves (objets isolés) → simple et iconique
3. Portraits des suspects → en dernier, le plus risqué visuellement
