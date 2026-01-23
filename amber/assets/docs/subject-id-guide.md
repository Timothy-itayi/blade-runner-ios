# Subject ID Creation Guide

Use this to create a passport-style ID for each subject and wire it into the game data.

## Checklist
- Create a passport photo (square/portrait, neutral background).
- Save it in `amber/assets/subjects-passports/` with a short name.
- Add `profilePic` to the subject entry in `amber/data/subjects.ts`.
- Ensure `idData` matches the passport identity details.

## Asset Naming
- Use lowercase, hyphen-free names where possible.
- Example: `vera.png`, `silas.png`, `eva.png`.

## Data Template (Subject Entry)
```ts
{
  name: 'FULL NAME',
  id: 'Sx-yy',
  // ...
  profilePic: require('../assets/subjects-passports/<file>.png'),
  idData: {
    name: 'FULL NAME',
    idCode: 'XX-0000-00',
    originPlanet: 'PLANET',
    statedPurpose: 'REASON',
    status: 'ACTIVE',
  },
  dossier: {
    name: 'FULL NAME',
    dateOfBirth: 'YYYY-MM-DD',
    address: 'ADDRESS',
    occupation: 'ROLE',
    sex: 'MALE' | 'FEMALE' | 'UNKNOWN',
  },
}
```

## Quick Sanity Checks
- `name` matches `idData.name` and `dossier.name`.
- `originPlanet` and `idData.originPlanet` align.
- `profilePic` file exists and is readable at runtime.
*** End Patch}}**This should error: instructions for add file require each line start with + and no code fences? need correct format. redo.**Let's apply patch properly.
