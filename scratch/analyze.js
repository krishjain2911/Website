import sharp from 'sharp';

async function checkEdges() {
  const { data: dL, info: iL } = await sharp('scratch/crop_square_light_f1.webp').raw().toBuffer({ resolveWithObject: true });
  // check top row, bottom row, left col, right col
  let maxDiffL = 0;
  const cornerL = [dL[0], dL[1], dL[2]];
  for (let x = 0; x < iL.width; x++) {
    // top
    const idxT = x * 3;
    maxDiffL = Math.max(maxDiffL, Math.abs(dL[idxT] - cornerL[0]), Math.abs(dL[idxT+1] - cornerL[1]), Math.abs(dL[idxT+2] - cornerL[2]));
    // bottom
    const idxB = ((iL.height - 1) * iL.width + x) * 3;
    maxDiffL = Math.max(maxDiffL, Math.abs(dL[idxB] - cornerL[0]), Math.abs(dL[idxB+1] - cornerL[1]), Math.abs(dL[idxB+2] - cornerL[2]));
  }
  for (let y = 0; y < iL.height; y++) {
    // left
    const idxL = y * iL.width * 3;
    maxDiffL = Math.max(maxDiffL, Math.abs(dL[idxL] - cornerL[0]), Math.abs(dL[idxL+1] - cornerL[1]), Math.abs(dL[idxL+2] - cornerL[2]));
    // right
    const idxR = (y * iL.width + iL.width - 1) * 3;
    maxDiffL = Math.max(maxDiffL, Math.abs(dL[idxR] - cornerL[0]), Math.abs(dL[idxR+1] - cornerL[1]), Math.abs(dL[idxR+2] - cornerL[2]));
  }
  console.log('Light frame corner:', cornerL, 'Max diff along borders:', maxDiffL);

  const { data: dD, info: iD } = await sharp('scratch/crop_square_dark_f1.webp').raw().toBuffer({ resolveWithObject: true });
  let maxDiffD = 0;
  const cornerD = [dD[0], dD[1], dD[2]];
  for (let x = 0; x < iD.width; x++) {
    const idxT = x * 3;
    maxDiffD = Math.max(maxDiffD, Math.abs(dD[idxT] - cornerD[0]), Math.abs(dD[idxT+1] - cornerD[1]), Math.abs(dD[idxT+2] - cornerD[2]));
    const idxB = ((iD.height - 1) * iD.width + x) * 3;
    maxDiffD = Math.max(maxDiffD, Math.abs(dD[idxB] - cornerD[0]), Math.abs(dD[idxB+1] - cornerD[1]), Math.abs(dD[idxB+2] - cornerD[2]));
  }
  for (let y = 0; y < iD.height; y++) {
    const idxL = y * iD.width * 3;
    maxDiffD = Math.max(maxDiffD, Math.abs(dD[idxL] - cornerD[0]), Math.abs(dD[idxL+1] - cornerD[1]), Math.abs(dD[idxL+2] - cornerD[2]));
    const idxR = (y * iD.width + iD.width - 1) * 3;
    maxDiffD = Math.max(maxDiffD, Math.abs(dD[idxR] - cornerD[0]), Math.abs(dD[idxR+1] - cornerD[1]), Math.abs(dD[idxR+2] - cornerD[2]));
  }
  console.log('Dark frame corner:', cornerD, 'Max diff along borders:', maxDiffD);
}

checkEdges();
