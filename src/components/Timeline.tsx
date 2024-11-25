"use client"
import React from 'react';
import { motion } from 'framer-motion';

const TimelineSection = () => {
  const timelineEvents = [
    {
      year: '1976',
      content: 'Fundación de la micro empresa familiar dirigida por Hector y Mirta Nasello junto con Carlos y Holga Garavano',
      icon: '💡'
    },
    {
      year: '2001',
      content: 'Cese de actividades.',
      icon: '📅'
    },
    {
      year: '2006',
      content: 'Reinserción en el mercado laboral a cargo de los hermanos Nasello.',
      icon: '🔄'
    },
    {
      year: '2008',
      content: 'Consolidación oficial de la Sociedad Anónima.',
      icon: '🏢'
    },
    {
      year: '2013',
      content: 'Adquisición de maquinarias y ampliación de depósito',
      icon: '⚡'
    },
    {
      year: '2018',
      content: 'Ampliación de planta productiva y gama de conductores eléctricos.',
      icon: '🏭'
    },
    {
      year: '2023',
      content: 'Certificación oficial de ISO 9001',
      icon: '✅'
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-20 ">
      <div className="container mx-auto px-4 z-1">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-16 text-primary"
        >
          Nuestra Historia
        </motion.h2>

        <div className="relative overflow-x-visible">
          {/* Línea horizontal */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform -translate-y-1/2" />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex justify-between relative px-4"
          >
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.year}
                variants={itemVariants}
                className="relative group"
                style={{ flex: '1' }}
              >
                {/* Punto y contenido */}
                <div className="flex flex-col items-center">
                  {/* Punto central */}
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full 
                             flex items-center justify-center z-10 mb-4 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-xl">{event.icon}</span>
                    </div>
                  </motion.div>

                  {/* Año */}
                  <motion.h3 
                    className="text-lg font-bold bg-gradient-to-r from-primary to-secondary 
                             bg-clip-text text-transparent mb-2"
                  >
                    {event.year}
                  </motion.h3>

                  {/* Card con contenido */}
                  <div className={`absolute w-48 ${
                    index % 2 === 0 ? 'top-20' : 'bottom-20'
                  } left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-300 z-20`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white p-4 rounded-xl shadow-lg"
                    >
                      <p className="text-sm text-gray-600">{event.content}</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;