# Gray-Box Modeling of Flanger Effect
This repository contains supplementary material for the EEICT 2026 paper Gray-Box Modeling of Flanger Effect.

### Abstract
This paper presents a gray-box neural network model of the flanger audio effect. The proposed architecture estimates the time-variant transfer function of the flanger effect and applies it to the Short-Time Fourier Transform (STFT) of the input signal to produce the output signal. The model was implemented in the PyTorch framework and evaluated using the error-to-signal ratio (ESR) metric, with results compared to a previously proposed black-box approach. Experimental results show that the model is capable of reproducing the typical comb-filter character of the flanger effect while achieving competitive performance for the considered parameter settings.

### Resources
- [Listening page](https://david-leitgeb.github.io/graybox-flanger/)

### Model Architecture
![Graphical interface of the proposed FX plug-in](/svg/fig\_model\_architecture.svg)