/* Pure map projection/geometry helpers shared by world map renderers. */
export const W=1000,H=500;
export function project(lon,lat){return[(lon+180)/360*W,(90-lat)/180*H]}
export function geomPath(geometry){
  if(!geometry)return"";
  const polys=geometry.type==="Polygon"?[geometry.coordinates]:geometry.type==="MultiPolygon"?geometry.coordinates:[];
  let d="";
  for(const poly of polys)for(const ring of poly){
    let prev=null;
    ring.forEach((p,i)=>{
      const lon=p[0],lat=p[1],[x,y]=project(lon,lat),jump=prev!==null&&Math.abs(lon-prev)>180;
      d+=(i===0||jump?"M":"L")+x.toFixed(2)+" "+y.toFixed(2);prev=lon;
    });
    d+="Z";
  }
  return d;
}
export function centroid(feature){
  let sx=0,sy=0,n=0;
  const walk=v=>{
    if(Array.isArray(v)&&typeof v[0]==="number"){const p=project(v[0],v[1]);sx+=p[0];sy+=p[1];n++}
    else if(Array.isArray(v))v.forEach(walk);
  };
  walk(feature.geometry?.coordinates);return n?[sx/n,sy/n]:[W/2,H/2];
}
