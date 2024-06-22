// DollarRain.js
import React, { useCallback } from 'react'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'

const DollarRain = () => {
  const particlesInit = useCallback(async engine => {
    console.log(engine)
    await loadFull(engine)
  }, [])

  const particlesLoaded = useCallback(async container => {
    console.log(container)
    return Promise.resolve()
  }, [])

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        fpsLimit: 60,
        particles: {
          number: {
            value: 0, // Изначально частиц нет
            density: {
              enable: true,
              value_area: 800,
            },
          },
          shape: {
            type: 'image',
            image: [
              {
                src: '/dollar.png',
                width: 100,
                height: 100,
              },
              {
                src: '/dollar.png',
                width: 50,
                height: 50,
              },
            ],
          },
          opacity: {
            value: 0.8,
            random: false,
          },
          size: {
            value: 30,
            random: true,
          },
          move: {
            enable: true,
            speed: 7,
            direction: 'bottom',
            random: false,
            straight: false,
            out_mode: 'out',
          },
          rotate: {
            value: 0,
            random: true,
            direction: 'random',
            animation: {
              enable: true,
              speed: 10,
              sync: false,
            },
          },
        },
        interactivity: {
          events: {
            onhover: {
              enable: true,
              mode: 'bubble',
            },
            onclick: {
              enable: true,
              mode: 'repulse',
            },
          },
          modes: {
            bubble: {
              distance: 200,
              size: 40,
              duration: 2,
              opacity: 8,
              speed: 3,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
          },
        },
        emitters: {
          direction: 'bottom',
          life: {
            count: 0,
            duration: 0.1,
            delay: 0.1,
          },
          rate: {
            delay: 0.1,
            quantity: 9, // Количество частиц за раз
          },
          size: {
            width: 100,
            height: 0,
          },
          position: {
            x: 50,
            y: 0,
          },
        },
        retina_detect: true,
      }}
    />
  )
}

export default DollarRain
