import Theme from '../theme'

// hierarchicalRepulsion', 'forceAtlas2Based

export const graphOptions = {
  layout: {
    hierarchical: false,
    randomSeed: 0.777,
  },
  physics: {
    enabled: true,
    solver: 'barnesHut',
    barnesHut: {
      gravitationalConstant: -2000,
      springLength: 150,
      springConstant: 0.005,
    },
  },
  edges: {
    smooth: true,
    color: Theme.palette[8],
    physics: true,
  },
  nodes: {
    color: {
      border: Theme.palette[0],
      background: Theme.palette[2],
      highlight: {
        border: Theme.palette[1],
        background: Theme.palette[3],
      },
    },
    shape: 'dot',
    size: 15,
    font: {
      color: Theme.palette[8],
    },
  },
}