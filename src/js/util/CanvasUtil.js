export const createCanvas = ( width, height ) => {
    const cvs  = document.createElement( "canvas" );
    cvs.width  = width;
    cvs.height = height;
    const ctx  = cvs.getContext( "2d" );
    
    return { cvs, ctx };
};
