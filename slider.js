(function($)
{
  $.fsSlider = (function(slider, sliderOptions)
  {
    var
      sliderId = $(slider).attr('id'),
      sliderRef = {
        self: $(slider),
        options: sliderOptions
      };
    $.fsSlider[ sliderId ] = {};
    $.fsSlider.loadImages(sliderId, sliderRef);
    $.fsSlider.setRedirect(sliderId, sliderRef);
    $.fsSlider.setClickActions(sliderId, sliderRef);
    $.fsSlider.rotation(sliderId, sliderRef);

    $(window).on('blur.' + sliderId, function()
    {
      //$.fsSlider.pauseSlider( sliderId );
    });

    $(window).on('focus.' + sliderId, function()
    {
      $.fsSlider.calculateImagesPositionSize( sliderId, sliderRef );
      $.fsSlider.positionAllImages( sliderId, sliderRef, false, false, sliderRef.options.rotateDirection );
      //$.fsSlider.unpauseSlider( sliderId, sliderRef );
    });

    $(window).on('resize.' + sliderId, function()
    {
      //$.fsSlider.pauseSlider(sliderId);
      $.fsSlider.calculateImagesPositionSize(sliderId, sliderRef);
      $.fsSlider.positionAllImages(sliderId, sliderRef, false, false);
      //$.fsSlider.unpauseSlider(sliderId, sliderRef);
    });

    return sliderRef;
  });

  $.fsSlider.extend = $.extend;

  $.fsSlider.defaults = {
    imageCount: 0,
    centeredImageNo: 0,
    imgUrls: [],
    width: '100%', // 	width of slider div - default 100% - accepts percentage or px values
    fullRotation: true, /* 	on each rotation the opposite img on the queue will move to the back - false, the
     images will stack on side until complete */
    fullRotationFade: true, /* 	depending on the rotateDirection - the last img will: fadeOut/slideUp, reposition,
     then fadeIn/slideDown if set to false animate across the slider div to it's new position */
    fullRotationFadeType: 'fade', /*	fade | slide	- if fullRotationFade set to true, the type of animation will be set here
     ( either fadeOut/fadeIn or slideUp/slideDown ) */
    bothDirections: true, /*	if imgs are stacked on either side, this will allow the rotation to change direction when the last
     img is reached requires fullRotation to be false */
    autoRotate: true, // 	allow rotation or remain static
    hoverPause: true, // 	pause rotation on hover over container div - autoRotate needs to be true for this to work
    rotateWait: 4000, // 	default wait between each auto rotation - 4 seconds
    rotateDirection: 'left-to-right', // 	default auto-rotate direction - alternative: 'right-to-left'
    rotateSpeed: 500, // 	default animation speed - 500 milliseconds
    arrows: true, // 	include navigation arrows?
    leftArrow: 'img/slider-back.png', // 	url to slider back button img - default: slider-back.png
    rightArrow: 'img/slider-next.png', // 	url to slider next button img - default: slider-next.png
    imgPointer: true, // 	change cursor to pointer when hovering over image
    hoverHighlight: true, // 	increase image size and z-index on mouseover, return to original on mouseout
    highlightHeightIncrease: 4, //  increase height of image in pixels - default 4px - automatically adjusts the width
    effect: 'linear', // default easing effect ( out of all provided by the JSTween library )
    navigation: true,
    navPosition: 'bottom',
    navArrows: true,
    navBullets: true,
    theme: 'fs-default'
  };

  $.fsSlider.effects = {
    ease: [
      'easeIn',
      'easeOut',
      'easeInOut',
      'easeInOutMix'
    ],
    cubic: [
      'cubicIn',
      'cubicOut',
      'cubicInOut',
      'cubicInOutMix'
    ],
    quart: [
      'quartIn',
      'quartOut',
      'quartInOut',
      'quartInOutMix'
    ],
    quint: [
      'quintIn',
      'quintOut',
      'quintInOut',
      'quintInOutMix'
    ],
    sine: [
      'sineIn',
      'sineOut',
      'sineInOut',
      'sineInOutMix'
    ],
    expo: [
      'expoIn',
      'expoOut',
      'expoInOut',
      'expoInOutMix'
    ],
    circ: [
      'circIn',
      'circOut',
      'circInOut',
      'circInOutMix'
    ],
    bounce: [
      'bounceIn',
      'bounceOut',
      'bounceInOut',
      'bounceInOutMix'
    ],
    elastic: [
      'elasticIn',
      'elasticOut',
      'elasticInOut',
      'elasticInOutMix'
    ]
  };

  $.fsSlider.extend({
    rotation: (function(sliderId, sliderRef)
    {
      if (sliderRef.options.autoRotate) {

        $.fsSlider[ sliderId ][ 'interval' ] = setInterval(function() {
          //alert( sliderRef.options.rotateDirection );
          if (sliderRef.options.rotateDirection === 'right-to-left') {
            if (sliderRef.options.centeredImageNo < sliderRef.options.imageCount) {
              sliderRef.options.centeredImageNo++;
            } else {
              sliderRef.options.centeredImageNo = 0;
            }
          } else {
            if (sliderRef.options.centeredImageNo > 0) {
              sliderRef.options.centeredImageNo--;
            } else {
              sliderRef.options.centeredImageNo = (sliderRef.options.imageCount);
            }
          }

          $.fsSlider.positionAllImages(sliderId, sliderRef, true, false);

        }, sliderRef.options.rotateWait);

        if (sliderRef.options.hoverPause === true) {

          $.fsSlider.setHover(sliderId, sliderRef);

        }

      }

    }),
    pauseSlider: (function(sliderId)
    {
      if ($.type($.fsSlider[ sliderId ][ 'interval' ]) !== 'undefined') {
        clearInterval($.fsSlider[ sliderId ][ 'interval' ]);
        $.fsSlider[ sliderId ][ 'interval' ] = undefined;
      }
    }),
    unpauseSlider: (function(sliderId, sliderRef)
    {
      if ($.type($.fsSlider[ sliderId ][ 'interval' ]) === 'undefined') {
        $.fsSlider.rotation(sliderId, sliderRef);
      }
    }),
    // set mouseenter and mouseleave events on this slider,
    // if the developer has chosen to allow automatic pausing.
    setHover: (function(sliderId, sliderRef)
    {
      sliderRef.self.hover(
        // on mouseenter clear the interval if the interval id is defined
        function()
        {
          $.fsSlider.pauseSlider(sliderId, sliderRef);
        },
        // on mouseleave start a new interval if one does not already exist.
        // undefined check is necessary to avoid multiple intervals being set.
        function()
        {
          $.fsSlider.unpauseSlider(sliderId, sliderRef);
        }
      );

    }),
    positionNavigationBar: (function(sliderId, sliderOptions)
    {

      var navTop, navLeft, navInnerDivs,
        intervalId,
        backNextWidth = 0,
        sliderMiddleSide = $('#' + sliderId + '-main-img-container'),
        navBar = $('#' + sliderId + '-navigation'),
        backButton = $('#' + sliderId + '-back') || undefined,
        nextButton = $('#' + sliderId + '-next') || undefined;

      if ($.type(backButton) !== 'undefined' && $.type(nextButton) !== 'undefined') {

        if (backButton.width() === 0) {
          backNextWidth += 30;
        }

        if (nextButton.width() === 0) {
          backNextWidth += 30;
        }

      }

      intervalId = setInterval(function()
      {
        if (navBar.width() > 0) {

          navInnerDivs = sliderMiddleSide.find('#' + sliderId + '-navigation div');

          navTop = (sliderOptions.navPosition === 'top') ?
          sliderMiddleSide.offset().top - Math.round(navBar.height() * 0.5) :
          sliderMiddleSide.offset().top + sliderOptions.lrgImg.height - Math.round(navBar.height() * 0.5);
          navLeft = Math.round(sliderMiddleSide.offset().left + (sliderMiddleSide.width() / 2) - ((navBar.width() + backNextWidth) / 2));

          navBar.css({
            top: navTop,
            left: navLeft
          });

          clearInterval(intervalId);

        }

      }, 50);

    }),

    calculateImagesPositionSize: (function(sliderId, sliderRef)
    {
      var accumRightSideImgs, countLeftSideImgs, countRightSideImgs, startImgTop,
        startImgLeft, endImgTop, endImgLeft, topDifference, leftDifference,
        sliderOptions = sliderRef.options,
        sliderObj = sliderRef.self,
        sliderLeftSide = sliderObj.find('#' + sliderId + '-left-side'),
        sliderLeftSideDivCenterTop = parseInt(sliderLeftSide.offset().top + (sliderLeftSide.height() / 2)),
        sliderLeftSideDivCenterLeft = parseInt(sliderLeftSide.offset().left + (sliderLeftSide.width() / 2)),
        sliderRightSide = sliderObj.find('#' + sliderId + '-right-side'),
        sliderRightSideDivCenterTop = parseInt(sliderRightSide.offset().top + (sliderRightSide.height() / 2)),
        sliderRightSideDivCenterLeft = parseInt(sliderRightSide.offset().left + (sliderRightSide.width() / 2)),
        sliderMiddleSide = sliderObj.find('#' + sliderId + '-main-img-container'),
        sliderMiddleTopPosition = parseInt(sliderMiddleSide.offset().top + (sliderMiddleSide.height() / 25)),
        sliderMiddleLeftPosition = parseInt(sliderMiddleSide.offset().left + (sliderMiddleSide.width() / 45));

      sliderOptions.positions = [];
      sliderOptions.lrgImg = {
        height: parseInt(sliderMiddleSide.height() - (sliderMiddleSide.height() / 15)),
        width: parseInt(sliderMiddleSide.width() - (sliderMiddleSide.width() / 25))
      };
      sliderOptions.smlImg = {
        height: parseInt(sliderOptions.lrgImg.height / 3),
        width: parseInt(sliderOptions.lrgImg.width / 3)
      };

      if (sliderOptions.fullRotation) {

        countLeftSideImgs = Math.floor((sliderOptions.imageCount + 1) / 2);
        countRightSideImgs = sliderOptions.imageCount - countLeftSideImgs;

      } else {

        countLeftSideImgs = 0;
        countRightSideImgs = 0;

        for (i = 0; i <= sliderOptions.imageCount; i++) {
          if (i < sliderOptions.centeredImageNo) {
            countLeftSideImgs++;
          } else if (i > sliderOptions.centeredImageNo) {
            countRightSideImgs++;
          }
        }
      }

      if (countLeftSideImgs > 0) {

        if (countLeftSideImgs === 1) {
          sliderOptions.positions[0] = [
            (parseInt(sliderLeftSideDivCenterTop - (sliderOptions.smlImg.height / 2))),
            (parseInt(sliderLeftSideDivCenterLeft - (sliderOptions.smlImg.width / 2)))
          ];

        } else if (countLeftSideImgs === 2) {

          sliderOptions.positions[ 0 ] = [
            parseInt((sliderLeftSideDivCenterTop - (sliderOptions.smlImg.height / 2) + parseInt(sliderOptions.smlImg.height / 4))),
            parseInt((sliderLeftSideDivCenterLeft - (sliderOptions.smlImg.width / 2) - (sliderOptions.smlImg.width / 15)))
          ];
          sliderOptions.positions[ 1 ] = [
            parseInt((sliderLeftSideDivCenterTop - (sliderOptions.smlImg.height / 2) - parseInt(sliderOptions.smlImg.height / 4))),
            parseInt((sliderLeftSideDivCenterLeft - (sliderOptions.smlImg.width / 2) + (sliderOptions.smlImg.width / 15)))
          ];

        } else {

          // first img in LS - bottom left
          startImgTop = Math.round(sliderLeftSide.offset().top + parseInt(sliderLeftSide.height() - ((sliderLeftSide.height() / 7)) - sliderOptions.smlImg.height));
          startImgLeft = Math.round(sliderLeftSide.offset().left + parseInt(sliderLeftSide.width() - (sliderLeftSide.width() / 16 * 15)));
          // last img in LS - top right
          endImgTop = Math.round(sliderLeftSide.offset().top + parseInt(sliderLeftSide.height() - (sliderLeftSide.height() / 7 * 6)));
          endImgLeft = Math.round(sliderLeftSide.offset().left + parseInt(sliderLeftSide.width() - (sliderLeftSide.width() / 16) - sliderOptions.smlImg.width));

          //diff between bottom left and top right (per img)
          topDifference = Math.round((endImgTop - startImgTop) / (countLeftSideImgs - 1));
          leftDifference = Math.round((endImgLeft - startImgLeft) / (countLeftSideImgs - 1));

          sliderOptions.positions[0] = [
            startImgTop,
            startImgLeft
          ];

          for (var i = 1; i < countLeftSideImgs; i++) {
            sliderOptions.positions[i] = [
              startImgTop + (topDifference * i),
              startImgLeft + (leftDifference * i)
            ];
          }
        }
      }
      sliderOptions.positions[ sliderOptions.positions.length ] = [
        sliderMiddleTopPosition,
        sliderMiddleLeftPosition
      ];

      if (countRightSideImgs > 0) {

        startImgTop = 0;
        startImgLeft = 0;
        endImgTop = 0;
        endImgLeft = 0;

        if (countRightSideImgs === 1) {

          sliderOptions.positions[ sliderOptions.positions.length ] = [
            (Math.round(sliderRightSideDivCenterTop - (sliderOptions.smlImg.height / 2))),
            (Math.round(sliderRightSideDivCenterLeft - (sliderOptions.smlImg.width / 2)))
          ];

        } else if (countRightSideImgs === 2) {

          sliderOptions.positions[ sliderOptions.positions.length ] = [
            Math.round(sliderRightSideDivCenterTop - (sliderOptions.smlImg.height / 2) - parseInt(sliderOptions.smlImg.height / 4)),
            Math.round(sliderRightSideDivCenterLeft - (sliderOptions.smlImg.width / 2) - (sliderOptions.smlImg.width / 15))
          ];
          sliderOptions.positions[ sliderOptions.positions.length ] = [
            Math.round(sliderRightSideDivCenterTop - (sliderOptions.smlImg.height / 2) + parseInt(sliderOptions.smlImg.height / 4)),
            Math.round(sliderRightSideDivCenterLeft - (sliderOptions.smlImg.width / 2) + (sliderOptions.smlImg.width / 15))
          ];

        } else {

          // first img in LS - bottom left
          startImgTop = sliderRightSide.offset().top + Math.round(sliderRightSide.height() - (sliderRightSide.height() / 70 * 59));
          startImgLeft = sliderRightSide.offset().left + Math.round(sliderRightSide.width() - (sliderRightSide.width() / 16 * 15));

          // last img in LS - top right
          endImgTop = sliderRightSide.offset().top + Math.round(sliderRightSide.height() - (sliderRightSide.height() / 7) - sliderOptions.smlImg.height);
          endImgLeft = sliderRightSide.offset().left + Math.round(sliderRightSide.width() - (sliderRightSide.width() / 16) - sliderOptions.smlImg.width);

          //diff between bottom left and top right (per img)
          topDifference = Math.round((endImgTop - startImgTop) / (countRightSideImgs - 1));
          leftDifference = Math.round((endImgLeft - startImgLeft) / (countRightSideImgs - 1));

          sliderOptions.positions[ sliderOptions.positions.length ] = [
            startImgTop,
            startImgLeft
          ];

          accumRightSideImgs = 1;

          for (var i = sliderOptions.positions.length; i < (sliderOptions.imageCount + 1); i++) {

            sliderOptions.positions[i] = [
              Math.round(startImgTop + (topDifference * accumRightSideImgs)),
              Math.round(startImgLeft + (leftDifference * accumRightSideImgs))
            ];

            accumRightSideImgs++;
          }
        }
      }

    }),
    positionAllImages: (function(sliderId, sliderRef, activateAnimation, imgClick, overrideRotateDirection, blurFocus) {
      var middlePos, middleImg, imgPosOffset, newOffset, prevOffset, newZIndex,
        lastPos, firstPos, rd, effect,
        slider = sliderRef,
        sliderObj = slider.self,
        sliderOptions = slider.options,
        sliderImgs = slider.sliderImgs;

      if (!sliderOptions.fullRotation && sliderOptions.bothDirections) {

        if (sliderOptions.centeredImageNo === 0) {
          sliderOptions.rotateDirection = 'right-to-left';
        } else if (sliderOptions.centeredImageNo === sliderOptions.imageCount) {
          sliderOptions.rotateDirection = 'left-to-right';
        }

      }

      if (activateAnimation) {

        middlePos = Math.ceil(sliderOptions.imageCount / 2);
        middleImg = sliderOptions.centeredImageNo;
        imgPosOffset = middlePos - middleImg;

        if (imgPosOffset < 0) {
          imgPosOffset = (sliderOptions.imageCount + 1) - (imgPosOffset * -1);
        }
        newZIndex = [];
        lastPos = middleImg + middlePos;
        rd = sliderOptions.rotateDirection;

        if ($.type(overrideRotateDirection) === 'string') {
          rd = overrideRotateDirection;
        }

        if (rd === 'left-to-right' && (sliderOptions.imageCount % 2) !== 1) {
          lastPos++;
        } else if (rd === 'right-to-left' && (sliderOptions.imageCount % 2) === 1) {
          lastPos--;
        }

        firstPos = lastPos + imgPosOffset;
        lastPos = (lastPos > sliderOptions.imageCount) ? lastPos - (sliderOptions.imageCount + 1) : lastPos;

        while (firstPos > sliderOptions.imageCount) {
          firstPos -= (sliderOptions.imageCount + 1);
        }

        effect = sliderOptions.effect;

        for (var i = 0; i <= sliderOptions.imageCount; i++) {

          newOffset = i + imgPosOffset;
          newOffset = (newOffset > sliderOptions.imageCount) ? (newOffset -= (sliderOptions.imageCount) + 1) : newOffset;
          newZIndex[ i ] = (newOffset < 10) ? '10' + newOffset : '1' + newOffset;

          if (effect.search('InOutMix') > -1) {
            effect = effect.replace('InOutMix', '');

            //console.log( 'newOffset:' + newOffset + ' middlePos:' + middlePos );
            effect = (rd === 'left-to-right') ? effect + 'In' : effect + 'Out';
          }

          prevOffset = (rd === 'left-to-right') ?
            (newOffset - 1 >= 0) ? newOffset - 1 : sliderOptions.imageCount
            : (newOffset + 1 > sliderOptions.imageCount) ? 0 : newOffset + 1;

          if (rd === 'left-to-right') {
            $('#' + sliderId + '-img-' + i).css('z-index', newZIndex[ i ]);
          }

          if (!sliderOptions.fullRotation) {

            $.fsSlider.calculateImagesPositionSize(sliderId, sliderRef);

            sliderImgs[ i ].css('z-index', i);

            if (i === sliderOptions.centeredImageNo) {

              sliderImgs[ i ].tween({
                top: {
                  stop: sliderOptions.positions[ i ][ 0 ],
                  duration: duration,
                  effect: effect
                },
                left: {
                  stop: sliderOptions.positions[ i ][ 1 ],
                  duration: duration,
                  effect: effect
                },
                width: {
                  stop: sliderOptions.lrgImg.width,
                  duration: duration
                },
                height: {
                  stop: sliderOptions.lrgImg.height,
                  duration: duration
                },
                opacity: {
                  stop: 100,
                  duration: duration
                }
              }).play();

            } else {

              sliderImgs[ i ].tween({
                top: {
                  stop: sliderOptions.positions[ i ][ 0 ],
                  duration: duration,
                  effect: effect
                },
                left: {
                  stop: sliderOptions.positions[ i ][ 1 ],
                  duration: duration,
                  effect: effect
                },
                width: {
                  stop: sliderOptions.smlImg.width,
                  duration: duration
                },
                height: {
                  stop: sliderOptions.smlImg.height,
                  duration: duration
                },
                opacity: {
                  stop: 80,
                  duration: duration
                }
              }).play();

            }

          } else {

            if (sliderOptions.fullRotationFade && sliderOptions.fullRotation && i === lastPos && !imgClick) {

              if (sliderOptions.fullRotationFadeType === 'slide') {

                sliderImgs[ i ].slideUp('medium', function() {
                  $(this).css({
                    top: sliderOptions.positions[ firstPos ][ 0 ],
                    left: sliderOptions.positions[ firstPos ][ 1 ],
                    width: sliderOptions.smlImg.width,
                    height: sliderOptions.smlImg.height
                  }).slideDown('medium', function() {
                    if (rd === 'right-to-left') {
                      $(this).css('z-index', newZIndex[ parseInt($(this).attr('id').replace(sliderId + '-img-', '')) ]);
                    }
                  });
                });

              } else {

                sliderImgs[ i ].tween({
                  opacity: {
                    stop: 0,
                    duration: (Math.round(sliderOptions.rotateSpeed / 100) / 2 / 10),
                    onStop: function(elem) {

                      $(elem).css({
                        top: sliderOptions.positions[ firstPos ][ 0 ],
                        left: sliderOptions.positions[ firstPos ][ 1 ],
                        width: sliderOptions.smlImg.width,
                        height: sliderOptions.smlImg.height,
                        zIndex: newZIndex[ parseInt($(elem).attr('id').replace(sliderId + '-img-', '')) ]
                      });
                      $(elem).tween({
                        opacity: {
                          stop: 90,
                          duration: (Math.round(sliderOptions.rotateSpeed / 100) / 2 / 10)
                        }
                      }).play();
                    }
                  }
                }).play();

              }

            } else if (i === (sliderOptions.centeredImageNo)) {

              var duration = Math.ceil(sliderOptions.rotateSpeed / 1000);

              sliderImgs[ i ].tween({
                top: {
                  stop: sliderOptions.positions[ newOffset ][ 0 ],
                  duration: duration,
                  effect: effect
                },
                left: {
                  stop: sliderOptions.positions[ newOffset ][ 1 ],
                  duration: duration,
                  effect: effect
                },
                width: {
                  stop: sliderOptions.lrgImg.width,
                  duration: duration
                },
                height: {
                  stop: sliderOptions.lrgImg.height,
                  duration: duration
                },
                opacity: {
                  stop: 100,
                  duration: duration
                },
                onStop: function(elem) {
                  if (rd === 'right-to-left') {
                    $(elem).css('z-index', newZIndex[ parseInt($(elem).attr('id').replace(sliderId + '-img-', '')) ]);
                  }
                }
              }).play();

            } else {

              var duration = Math.ceil(sliderOptions.rotateSpeed / 1000);

              if (!imgClick) {

                sliderImgs[ i ].tween({
                  top: {
                    start: sliderOptions.positions[ prevOffset ][ 0 ],
                    stop: sliderOptions.positions[ newOffset ][ 0 ],
                    duration: duration,
                    effect: effect
                  },
                  left: {
                    start: sliderOptions.positions[ prevOffset ][ 1 ],
                    stop: sliderOptions.positions[ newOffset ][ 1 ],
                    duration: duration,
                    effect: effect
                  }
                });

              } else {

                sliderImgs[ i ].tween({
                  top: {
                    stop: sliderOptions.positions[ newOffset ][ 0 ],
                    duration: duration,
                    effect: effect
                  },
                  left: {
                    stop: sliderOptions.positions[ newOffset ][ 1 ],
                    duration: duration,
                    effect: effect
                  }
                });

              }

              sliderImgs[ i ].tween({
                width: {
                  stop: sliderOptions.smlImg.width,
                  duration: duration
                },
                height: {
                  stop: sliderOptions.smlImg.height,
                  duration: duration
                },
                opacity: {
                  stop: 90,
                  duration: duration
                },
                onStop: function(elem) {
                  if (rd === 'right-to-left') {
                    $(elem).css('z-index', newZIndex[ parseInt($(elem).attr('id').replace(sliderId + '-img-', '')) ]);
                  }
                }
              }).play();

            }
          }
        }

      } else {
        newZIndex = [];
        for (i = 0; i <= sliderOptions.imageCount; i++) {

          middlePos = Math.ceil(sliderOptions.imageCount / 2);
          middleImg = sliderOptions.centeredImageNo;
          imgPosOffset = middlePos - middleImg;

          newOffset = i + imgPosOffset;
          newOffset = (newOffset > sliderOptions.imageCount) ? (newOffset -= (sliderOptions.imageCount + 1)) : newOffset;
          newZIndex[ i ] = (newOffset < 10) ? '10' + newOffset : '1' + newOffset;

          prevOffset = (rd === 'left-to-right') ?
            (newOffset - 1 >= 0) ? newOffset - 1 : sliderOptions.imageCount
            : (newOffset + 1 > sliderOptions.imageCount) ? 0 : newOffset + 1;

          if (i === sliderOptions.centeredImageNo) {

            sliderImgs[ i ].css({
              top: sliderOptions.positions[ newOffset ][ 0 ],
              left: sliderOptions.positions[ newOffset ][ 1 ],
              width: sliderOptions.lrgImg.width,
              height: sliderOptions.lrgImg.height,
              opacity: 1
            });

          } else {

            sliderImgs[ i ].css({
              top: sliderOptions.positions[ newOffset ][ 0 ],
              left: sliderOptions.positions[ newOffset ][ 1 ],
              width: sliderOptions.smlImg.width,
              height: sliderOptions.smlImg.height,
              opacity: 0.9
            });

          }
        }
      }
      if (sliderOptions.navBullets) {

        $('#' + sliderId + '-navigation div').removeClass('nav-centered');
        $('#nav-' + sliderOptions.centeredImageNo).addClass('nav-centered');

      }

      $.fsSlider.positionNavigationBar(sliderId, sliderOptions);
    }),
    loadImages: (function(sliderId, sliderRef) {
      var newZIndex, hi, halfBorderWidth, oCss, nCss, nav, navStyle, navBackNextStyle,
        imageCounter = 0,
        sliderObj = sliderRef.self,
        sliderOptions = sliderRef.options,
        sliderImgs = [];

      sliderObj.width(sliderOptions.width);
      sliderObj.css({
        height: parseInt(sliderObj.width() / 3),
        margin: '0 auto'
      });

      sliderOptions.imageCount = (sliderObj.find('img').length - 1);
      if (sliderOptions.imageCount > 1) {
        sliderOptions.centeredImageNo = Math.round(sliderOptions.imageCount / 2);

        sliderObj.addClass(sliderOptions.theme);
        // add containers for positioning of images
        sliderObj.append(
          // eg #slider-left-side || #fsslider-left-side
          '<div id="' + sliderId + '-left-side" ' +
            // eg .slider-side || .fsslider-side
          'class="' + sliderId + '-side" style="width:25%;height:100%;float:left;"></div>' +
            // eg #slider-main-img-container || #fsslider-main-img-container
          '<div id="' + sliderId + '-main-img-container" style="width:50%;height:100%;float:left;"></div>' +
            // eg #slider-right-side || #fsslider-right-side
          '<div id="' + sliderId + '-right-side" ' +
            // eg .slider-side || .fsslider-side
          'class="' + sliderId + '-side" style="width:25%;height:100%;float:left;"></div>'
        );

        sliderRef.sliderImgs = [];

        sliderObj.find('img').each(function() {
          sliderRef.sliderImgs[ imageCounter ] = $(this);
          newZIndex = ((imageCounter < 10) ? '10' : '1') + imageCounter;
          var imgCss = {
            'z-index': newZIndex,
            position: 'absolute',
            top: 0,
            left: 0
          };

          if (sliderOptions.imgPointer) {
            imgCss.cursor = 'pointer';
          }

          sliderRef.sliderImgs[ imageCounter ].attr('id', sliderId + '-img-' + imageCounter).attr('class', sliderId + '-img').css(imgCss);

          if (imageCounter === sliderOptions.centeredImageNo) {
            sliderRef.sliderImgs[ imageCounter ].addClass(sliderId + '-main-img');
          }

          if (sliderOptions.hoverHighlight) {

            hi = sliderOptions.highlightHeightIncrease;
            halfBorderWidth = 0;

            sliderRef.sliderImgs[ imageCounter ].hover(function() {

              var $this = $(this);
              if (!sliderOptions.hoverPause || !$this.is(':animated')) {
                if (parseInt($this.attr('id').replace(sliderId + '-img-', '')) !== sliderOptions.centeredImageNo) {
                  oCss = {
                    height: $(this).height(),
                    width: $(this).width(),
                    top: $(this).offset().top,
                    left: $(this).offset().left,
                    'z-index': parseInt($(this).css('z-index'))
                  };
                  nCss = {
                    height: (oCss.height + hi),
                    width: (oCss.width + Math.round(hi * 1.5)),
                    top: (oCss.top + Math.round(hi * 0.5)),
                    left: (oCss.left - Math.round(hi * 0.75)),
                    'z-index': (oCss[ 'z-index' ] + 20)
                  };
                  $(this).css(nCss);
                }
              }

            }, function() {
              var $this = $(this),
                $thisId = parseInt($(this).attr('id').replace(sliderId + '-img-', ''));

              if (!sliderOptions.hoverPause) {

                if (!$this.is(':animated') && $thisId !== sliderOptions.centeredImageNo) {
                  if ($.type(nCss) !== 'undefined' && $this.offset().top === (nCss.top)) {
                    $this.css(oCss);
                  }
                }

              } else {

                if ($thisId !== sliderOptions.centeredImageNo) {
                  if ($.type($this.offset().top) !== 'undefined' && $this.offset().top === (nCss.top)) {
                    $this.css(oCss);
                  }
                }

              }
            });
          }
          imageCounter++;
        });
        if (sliderOptions.navigation) {

          navStyle = ' style="float:left;margin:5px;height:20px;width:20px!important;';
          navBackNextStyle = ' style="float:left;height:30px;width:30px;';

          if (sliderOptions.imgPointer) {
            navStyle += 'cursor:pointer;';
            navBackNextStyle += 'cursor:pointer;';
          }

          navStyle += '"';
          navBackNextStyle += '"';

          nav = '<div id="' + sliderId + '-navigation" style="display:none;position:absolute;z-index:2000">';

          if (sliderOptions.navArrows)
            nav += '<div id="' + sliderId + '-back" ' + navBackNextStyle + '></div>';

          if (sliderOptions.navBullets) {

            for (var i = 0; i < imageCounter; i++) {

              nav += '<div id="nav-' + i + '" class="nav';
              if (i === sliderOptions.centeredImageNo)
                nav += ' nav-centered';
              nav += '"' + navStyle + ' ></div>';

            }
          }

          if (sliderOptions.navArrows)
            nav += '<div id="' + sliderId + '-next" ' + navBackNextStyle + '></div>';

          sliderObj.find('#' + sliderId + '-main-img-container').append(nav);
        }

        $.fsSlider.calculateImagesPositionSize(sliderId, sliderRef);
        $.fsSlider.positionAllImages(sliderId, sliderRef, false, false);

        $('#' + sliderId + ' img, #' + sliderId + '-navigation').delay(400).fadeIn('medium');
      }
    }),
    sliderImageClicked: (function(sliderId, sliderRef, sliderImage) {
      var sBId = parseInt($(sliderImage).attr('id').replace(sliderId + '-img-', ''));

      if (sBId !== sliderRef.options.centeredImageNo) {

        // if slider does not automatically pause on hover,
        // reset interval to avoid more than one set of animations
        // in quick succession
        if (!sliderRef.options.hoverPause) {
          $.fsSlider.pauseSlider(sliderId);
          $.fsSlider.unpauseSlider(sliderId, sliderRef);
        }

        sliderRef.options.centeredImageNo = sBId;
        $.fsSlider.positionAllImages(sliderId, sliderRef, true, true);

      } else {

        window.location.href = sliderRef.imgUrls[ sBId ];

      }

    }),
    setClickActions: (function(sliderId, sliderRef) {
      var self, id, src, newSrc, count, timeoutId, direction;

      $('#' + sliderId + '-back,#' + sliderId + '-next').click(function(e) {

        id = $(this).attr('id').replace(sliderId + '-', '');

        if ($.type(timeoutId) !== 'number') {

          timeoutId = setTimeout(function() {
            timeoutId = undefined;
          }, (sliderRef.options.rotateSpeed * 2));

          // if slider does not automatically pause on hover,
          // reset interval to avoid more than one set of animations
          // in quick succession
          if (!sliderRef.options.hoverPause) {
            $.fsSlider.pauseSlider(sliderId);
            $.fsSlider.unpauseSlider(sliderId, sliderRef);
          }

          if (id === 'back') {
            direction = 'left-to-right';

            if (sliderRef.options.centeredImageNo > 0)
              sliderRef.options.centeredImageNo--;
            else
              sliderRef.options.centeredImageNo = sliderRef.options.imageCount;

          } else {
            direction = 'right-to-left';

            if (sliderRef.options.centeredImageNo < sliderRef.options.imageCount)
              sliderRef.options.centeredImageNo++;
            else
              sliderRef.options.centeredImageNo = 0;

          }

          $.fsSlider.positionAllImages(sliderId, sliderRef, true, false, direction);

        }

        e.stopImmediatePropagation();

      });

      $('#' + sliderId + '-navigation div').click(function() {

        self = $(this);
        id = parseInt(self.attr('id').replace('nav-', ''));
        $.fsSlider.sliderImageClicked(sliderId, sliderRef, $('#' + sliderId + '-img-' + id));

      });

      $('.' + sliderId + '-img').each(function() {
        $(this).click(function() {
          $.fsSlider.sliderImageClicked(sliderId, sliderRef, this);
        });
      });
    }),
    setRedirect: (function(sliderId, sliderRef) {
      var imageCounter = 0;
      var imgHref = '';
      $('#' + sliderId + ' a').each(function() {
        imgHref = $.trim($(this).attr('href'));
        if (imgHref.length > 0) {
          if (!sliderRef.imgUrls) {
            sliderRef.imgUrls = [];
          }
          sliderRef.imgUrls[ imageCounter ] = $.trim(imgHref);
        }
        imageCounter++;
      });
    })

  });

  $.fn.fsSlider = (function(options) {

    var effect, effectType,
      optType = $.type(options),
      sliderOptions = $.extend({}, $.fsSlider.defaults);

    if (optType === 'array' || (optType === 'object' && !$.isEmptyObject(options))) {

      if ($.type(options.effect) !== 'undefined') {

        effect = options.effect;

        if (effect.search('In') > -1) {

          effect = effect.substring(0, effect.search('In'));

        }

        if (effect.search('Out') > -1) {

          effect = effect.substring(0, effect.search('Out'));

        }

        effectType = $.type($.fsSlider.effects[ effect ]);

        if (effectType !== 'array' || (effectType === 'array' && $.inArray(options.effect, $.fsSlider.effects) > -1)) {

          options.effect = undefined;

        }

      }

      sliderOptions = $.extend(sliderOptions, options);

      // rotate wait must be at least double rotate speed or the animations overlap
      if (sliderOptions.rotateWait < (sliderOptions.rotateSpeed * 2)) {
        sliderOptions.rotateWait = sliderOptions.rotateSpeed * 2;
      }

    }

    //new
    $.fsSlider(this, sliderOptions);
    return true;
  });

  $.fn.fsDestroy = (function()
  {
    var id = $(this).attr('id');

    // clear the interval controlling rotation delay (if one exists)
    if ($.type($.fsSlider[ id ][ 'interval' ]) !== 'undefined') {

      clearInterval($.fsSlider[ id ][ 'interval' ]);

    }

    // unbind window events specific to this instance of the slider
    $(window).off('blur.' + id);
    $(window).off('focus.' + id);
    $(window).off('resize.' + id);

    $('#' + id + '-img').off('hover');

  });

}(jQuery));