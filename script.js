
window.MathJax = {
  startup: {
    ready: () => {
      MathJax.startup.defaultReady();
      MathJax.startup.promise.then(() => {
        window.dispatchEvent(new Event('resize'));
      });
    }
  }
};

function anchor(div){
  let posX = div.offsetLeft;
  let posY = div.offsetTop;
  let height = div.clientHeight;
  let width = div.clientWidth;
  east = {x: posX + width, y: posY + height/2};
  west = {x: posX, y: posY + height/2}
  return {east: east, west: west};
}

function initTree(div){
  svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  div.appendChild(svg);
  function drawEdge(x1,y1,x2,y2){
    console.log("drawing edge" + x1 + y1 + x2 + y2);
    let line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',x1);
    line.setAttribute('y1',y1);
    line.setAttribute('x2',x2);
    line.setAttribute('y2',y2);
    svg.appendChild(line);
  }

  function getTreeRec(ul,beginRow,beginColumn){
    if(ul.tagName !== 'UL'){
      console.log(ul.tagName + ", not <ul>!");
      document.getElementById("error").appendChild(ul);
    }
    let height = 0;
    let children = [];
    let index = 0;
    while(index < ul.children.length){
      child = ul.children[index];
      if(child.tagName === 'LI'){
        ul.removeChild(child);
        let rec = getTreeRec(child.removeChild(child.firstElementChild),beginRow + height, beginColumn + 1);
        children.push(rec.tree);
        height += rec.height;
      }
      else{
        index++;
      }
    }
    let nodeDiv = document.createElement('div');
    while(ul.firstChild){
      nodeDiv.appendChild(ul.removeChild(ul.firstChild));
    }
    if(children.length == 0){
      height = 1;
    }
    nodeDiv.classList.add('treenode');
    nodeDiv.style["grid-row"] = beginRow + " / span " + height;
    nodeDiv.style["grid-column"] = beginColumn + "/ span " + 1;
    div.appendChild(nodeDiv);
    function draw(){
      if(children.length==0){
        return;
      }
      parPos = anchor(nodeDiv).east;
      childPos = [];
      children.forEach((c)=> childPos.push(anchor(c.node).west));
      let min_x = childPos[0].x;
      let min_y = childPos[0].y;
      let max_y = childPos[0].y;
      childPos.forEach((c) => {
        if(c.x<min_x){
          min_x=c.x;
        }
        if(c.y<min_y){
          min_y=c.y;
        }
        if(c.y>max_y){
          max_y=c.y;
        }
      });
      drawEdge(parPos.x,parPos.y,(min_x+parPos.x)/2,parPos.y);
      drawEdge((min_x+parPos.x)/2,min_y,(min_x+parPos.x)/2,max_y);
      childPos.forEach((c) => drawEdge((min_x+parPos.x)/2,c.y,c.x,c.y));
      children.forEach((c)=>c.draw());
    }
    let tree = {node: nodeDiv, children: children, draw: draw};
    return {tree: tree, height: height}
  }
  let tree = getTreeRec(div.removeChild(div.firstElementChild),1,1).tree;
    
  function redraw(){
    while(svg.firstChild){
      svg.removeChild(svg.firstChild);
    }
    tree.draw();
  }
  window.addEventListener('resize', redraw);
  redraw();
  return {tree: tree, redraw: redraw};
}

document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll('.tree').forEach(initTree);
});
