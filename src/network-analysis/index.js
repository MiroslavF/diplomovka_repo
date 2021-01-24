const getNodeCount = require('./node-count');
const getEdgeCount = require('./edge-count');
const getAverageNodeDegree = require('./average-node-degree');
const getNormalDegreeDistribution = require('./degree-distribution/normal');
const getNormalLogBinnedDegreeDistribution = require('./degree-distribution/normal-log-binned');
const getCumulativeDegreeDistribution = require('./degree-distribution/cumulative');
const getCumulativeLogBinnedDegreeDistribution = require('./degree-distribution/cumulative-log-binned');
const getDistanceDistribution = require('./distance-distribution');
const getDiameter = require('./diameter');
const getAverageDistance = require('./average-distance');
const getClusteringCoefficientDistribution = require('./clustering-coefficient-distribution');
const getAverageClusteringCoefficient = require('./average-clustering-coefficient');
const getHierarchicalClustering = require('./hierarchical-clustering/hierarchical-clustering');
const getLogBinnedHierarchicalClustering = require('./hierarchical-clustering/log-binned');
const getHierarchicalClusteringRegression = require('./hierarchical-clustering/regressions');
const getDegreeExponents = require('./degree-exponent');
const { getDegreeCorrelations, getRandomizedDegreeCorrelations } = require('./degree-correlations');

module.exports = {
    getNodeCount,
    getEdgeCount,
    getAverageNodeDegree,
    getNormalDegreeDistribution,
    getNormalLogBinnedDegreeDistribution,
    getCumulativeDegreeDistribution,
    getCumulativeLogBinnedDegreeDistribution,
    getDistanceDistribution,
    getDiameter,
    getAverageDistance,
    getClusteringCoefficientDistribution,
    getAverageClusteringCoefficient,
    getHierarchicalClustering,
    getLogBinnedHierarchicalClustering,
    getHierarchicalClusteringRegression,
    getDegreeExponents,
    getDegreeCorrelations,
    getRandomizedDegreeCorrelations,
};