// js/products.js
// CoreMark — Single source of truth for all boosters and bundles
// 88 individual boosters across Math (39), Science (27), Computing (22)
// Stages 7, 8, 9 — subject-locked 5-packs — full subject — full stage
//
// Slug convention : {subject}-{strandCode}-{topicSlug}-s{stage}
//   e.g.  math-n1-integers-s8
//         sci-b1-photosynthesis-carbon-cycle-s9
//         comp-p1-flowcharts-selection-s7
//
// R2 key (populated at upload time): booster/cm-{slug}-{hash}.pdf
// Leave r2Key null until the PDF is uploaded and hash is known.
//
// Prices (paise — multiply ₹ × 100):
//   Single        ₹249  →  24900
//   5-pack        ₹799  →  79900
//   Full subject  ₹1299 → 129900
//   Full stage    ₹2499 → 249900

'use strict';

window.CM_PRODUCTS = {

  // ─────────────────────────────────────────────────────────────
  // BOOSTERS  (88 entries)
  // ─────────────────────────────────────────────────────────────
  boosters: {

    // ══════════════════════════════════════════════
    // MATHEMATICS — STAGE 7  (8 boosters)
    // ══════════════════════════════════════════════

    'math-n1-integers-s7': {
      slug:       'math-n1-integers-s7',
      topicCode:  'M·N1',
      name:       'Integers',
      subject:    'math',
      stage:      7,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Adding and subtracting integers','Multiplying and dividing integers','Lowest common multiples','Highest common factors','Tests for divisibility','Square roots and cube roots'],
      r2Key:      null,
    },
    'math-n2-place-value-rounding-s7': {
      slug:       'math-n2-place-value-rounding-s7',
      topicCode:  'M·N2',
      name:       'Place Value and Rounding',
      subject:    'math',
      stage:      7,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Multiplying and dividing by powers of 10','Rounding'],
      r2Key:      null,
    },
    'math-n3-decimals-s7': {
      slug:       'math-n3-decimals-s7',
      topicCode:  'M·N3',
      name:       'Decimals',
      subject:    'math',
      stage:      7,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Ordering decimals','Adding and subtracting decimals','Multiplying decimals','Dividing decimals','Making decimal calculations easier'],
      r2Key:      null,
    },
    'math-n4-fractions-s7': {
      slug:       'math-n4-fractions-s7',
      topicCode:  'M·N4',
      name:       'Fractions',
      subject:    'math',
      stage:      7,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Ordering fractions','Adding mixed numbers','Multiplying fractions','Dividing fractions','Making fraction calculations easier'],
      r2Key:      null,
    },
    'math-a1-expressions-formulae-equations-s7': {
      slug:       'math-a1-expressions-formulae-equations-s7',
      topicCode:  'M·A1',
      name:       'Expressions, Formulae and Equations',
      subject:    'math',
      stage:      7,
      strand:     'Algebra',
      strandCode: 'A',
      pricePaise: 24900,
      subtopics:  ['Constructing expressions','Using expressions and formulae','Collecting like terms','Expanding brackets','Constructing and solving equations','Inequalities'],
      r2Key:      null,
    },
    'math-g1-angles-constructions-s7': {
      slug:       'math-g1-angles-constructions-s7',
      topicCode:  'M·G1',
      name:       'Angles and Constructions',
      subject:    'math',
      stage:      7,
      strand:     'Geometry and Measure',
      strandCode: 'G',
      pricePaise: 24900,
      subtopics:  ['A sum of 360°','Intersecting lines','Drawing lines and quadrilaterals'],
      r2Key:      null,
    },
    'math-g2-shapes-symmetry-s7': {
      slug:       'math-g2-shapes-symmetry-s7',
      topicCode:  'M·G2',
      name:       'Shapes and Symmetry',
      subject:    'math',
      stage:      7,
      strand:     'Geometry and Measure',
      strandCode: 'G',
      pricePaise: 24900,
      subtopics:  ['Identifying the symmetry of 2D shapes','Circles and polygons','Recognising congruent shapes','3D shapes'],
      r2Key:      null,
    },
    'math-s1-collecting-data-s7': {
      slug:       'math-s1-collecting-data-s7',
      topicCode:  'M·S1',
      name:       'Collecting Data',
      subject:    'math',
      stage:      7,
      strand:     'Statistics',
      strandCode: 'S',
      pricePaise: 24900,
      subtopics:  ['Conducting an investigation','Taking a sample'],
      r2Key:      null,
    },

    // ══════════════════════════════════════════════
    // MATHEMATICS — STAGE 8  (16 boosters)
    // ══════════════════════════════════════════════

    'math-n1-integers-s8': {
      slug:       'math-n1-integers-s8',
      topicCode:  'M·N1',
      name:       'Integers',
      subject:    'math',
      stage:      8,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Factors, multiples and primes','Multiplying and dividing integers','Square roots and cube roots','Indices'],
      r2Key:      null,
    },
    'math-n2-place-value-rounding-s8': {
      slug:       'math-n2-place-value-rounding-s8',
      topicCode:  'M·N2',
      name:       'Place Value and Rounding',
      subject:    'math',
      stage:      8,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Multiplying and dividing by 0.1 and 0.01','Rounding'],
      r2Key:      null,
    },
    'math-n3-decimals-s8': {
      slug:       'math-n3-decimals-s8',
      topicCode:  'M·N3',
      name:       'Decimals',
      subject:    'math',
      stage:      8,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Ordering decimals','Multiplying decimals','Dividing by decimals','Making decimal calculations easier'],
      r2Key:      null,
    },
    'math-n4-fractions-s8': {
      slug:       'math-n4-fractions-s8',
      topicCode:  'M·N4',
      name:       'Fractions',
      subject:    'math',
      stage:      8,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Fractions and recurring decimals','Ordering fractions','Subtracting mixed numbers','Multiplying an integer by a mixed number','Dividing an integer by a fraction','Making fraction calculations easier'],
      r2Key:      null,
    },
    'math-n5-percentages-s8': {
      slug:       'math-n5-percentages-s8',
      topicCode:  'M·N5',
      name:       'Percentages',
      subject:    'math',
      stage:      8,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Percentage increases and decreases','Using a multiplier'],
      r2Key:      null,
    },
    'math-n6-ratio-proportion-s8': {
      slug:       'math-n6-ratio-proportion-s8',
      topicCode:  'M·N6',
      name:       'Ratio and Proportion',
      subject:    'math',
      stage:      8,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Simplifying ratios','Sharing in a ratio','Ratio and direct proportion'],
      r2Key:      null,
    },
    'math-a1-expressions-formulae-equations-s8': {
      slug:       'math-a1-expressions-formulae-equations-s8',
      topicCode:  'M·A1',
      name:       'Expressions, Formulae and Equations',
      subject:    'math',
      stage:      8,
      strand:     'Algebra',
      strandCode: 'A',
      pricePaise: 24900,
      subtopics:  ['Constructing expressions','Using expressions and formulae','Expanding brackets','Factorising','Constructing and solving equations','Inequalities'],
      r2Key:      null,
    },
    'math-a2-sequences-functions-s8': {
      slug:       'math-a2-sequences-functions-s8',
      topicCode:  'M·A2',
      name:       'Sequences and Functions',
      subject:    'math',
      stage:      8,
      strand:     'Algebra',
      strandCode: 'A',
      pricePaise: 24900,
      subtopics:  ['Generating sequences','Finding rules for sequences','Using the nth term','Representing simple functions'],
      r2Key:      null,
    },
    'math-a3-graphs-s8': {
      slug:       'math-a3-graphs-s8',
      topicCode:  'M·A3',
      name:       'Graphs',
      subject:    'math',
      stage:      8,
      strand:     'Algebra',
      strandCode: 'A',
      pricePaise: 24900,
      subtopics:  ['Functions','Plotting graphs','Gradient and intercept','Interpreting graphs'],
      r2Key:      null,
    },
    'math-g1-angles-constructions-s8': {
      slug:       'math-g1-angles-constructions-s8',
      topicCode:  'M·G1',
      name:       'Angles and Constructions',
      subject:    'math',
      stage:      8,
      strand:     'Geometry and Measure',
      strandCode: 'G',
      pricePaise: 24900,
      subtopics:  ['Parallel lines','The exterior angle of a triangle','Constructions'],
      r2Key:      null,
    },
    'math-g2-shapes-symmetry-s8': {
      slug:       'math-g2-shapes-symmetry-s8',
      topicCode:  'M·G2',
      name:       'Shapes and Symmetry',
      subject:    'math',
      stage:      8,
      strand:     'Geometry and Measure',
      strandCode: 'G',
      pricePaise: 24900,
      subtopics:  ['Quadrilaterals and polygons','The circumference of a circle','3D shapes'],
      r2Key:      null,
    },
    'math-g3-position-transformation-s8': {
      slug:       'math-g3-position-transformation-s8',
      topicCode:  'M·G3',
      name:       'Position and Transformation',
      subject:    'math',
      stage:      8,
      strand:     'Geometry and Measure',
      strandCode: 'G',
      pricePaise: 24900,
      subtopics:  ['Bearings','The midpoint of a line segment','Translating 2D shapes','Reflecting shapes','Rotating shapes','Enlarging shapes'],
      r2Key:      null,
    },
    'math-g4-distance-area-volume-s8': {
      slug:       'math-g4-distance-area-volume-s8',
      topicCode:  'M·G4',
      name:       'Distance, Area and Volume',
      subject:    'math',
      stage:      8,
      strand:     'Geometry and Measure',
      strandCode: 'G',
      pricePaise: 24900,
      subtopics:  ['Converting between miles and kilometres','The area of a parallelogram and a trapezium','Calculating the volume of triangular prisms','Calculating the surface area of triangular prisms and pyramids'],
      r2Key:      null,
    },
    'math-s1-collecting-data-s8': {
      slug:       'math-s1-collecting-data-s8',
      topicCode:  'M·S1',
      name:       'Collecting Data',
      subject:    'math',
      stage:      8,
      strand:     'Statistics and Probability',
      strandCode: 'S',
      pricePaise: 24900,
      subtopics:  ['Data collection','Sampling'],
      r2Key:      null,
    },
    'math-s2-probability-s8': {
      slug:       'math-s2-probability-s8',
      topicCode:  'M·S2',
      name:       'Probability',
      subject:    'math',
      stage:      8,
      strand:     'Statistics and Probability',
      strandCode: 'S',
      pricePaise: 24900,
      subtopics:  ['Calculating probabilities','Experimental and theoretical probabilities'],
      r2Key:      null,
    },
    'math-s3-interpreting-discussing-results-s8': {
      slug:       'math-s3-interpreting-discussing-results-s8',
      topicCode:  'M·S3',
      name:       'Interpreting and Discussing Results',
      subject:    'math',
      stage:      8,
      strand:     'Statistics and Probability',
      strandCode: 'S',
      pricePaise: 24900,
      subtopics:  ['Interpreting and drawing frequency diagrams','Time series graphs','Stem-and-leaf diagrams','Pie charts','Representing data','Using statistics'],
      r2Key:      null,
    },

    // ══════════════════════════════════════════════
    // MATHEMATICS — STAGE 9  (15 boosters)
    // ══════════════════════════════════════════════

    'math-n1-number-calculation-s9': {
      slug:       'math-n1-number-calculation-s9',
      topicCode:  'M·N1',
      name:       'Number and Calculation',
      subject:    'math',
      stage:      9,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Irrational numbers','Standard form','Indices'],
      r2Key:      null,
    },
    'math-n2-decimals-percentages-rounding-s9': {
      slug:       'math-n2-decimals-percentages-rounding-s9',
      topicCode:  'M·N2',
      name:       'Decimals, Percentages and Rounding',
      subject:    'math',
      stage:      9,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Multiplying and dividing by powers of 10','Multiplying and dividing decimals','Understanding compound percentages','Understanding upper and lower bounds'],
      r2Key:      null,
    },
    'math-n3-fractions-s9': {
      slug:       'math-n3-fractions-s9',
      topicCode:  'M·N3',
      name:       'Fractions',
      subject:    'math',
      stage:      9,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Fractions and recurring decimals','Fractions and the correct order of operations','Multiplying fractions','Dividing fractions','Making calculations easier'],
      r2Key:      null,
    },
    'math-n4-ratio-proportion-s9': {
      slug:       'math-n4-ratio-proportion-s9',
      topicCode:  'M·N4',
      name:       'Ratio and Proportion',
      subject:    'math',
      stage:      9,
      strand:     'Number',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Using ratios','Direct and inverse proportion'],
      r2Key:      null,
    },
    'math-a1-expressions-formulae-s9': {
      slug:       'math-a1-expressions-formulae-s9',
      topicCode:  'M·A1',
      name:       'Expressions and Formulae',
      subject:    'math',
      stage:      9,
      strand:     'Algebra',
      strandCode: 'A',
      pricePaise: 24900,
      subtopics:  ['Substituting into expressions','Constructing expressions','Expressions and indices','Expanding the product of two linear expressions','Simplifying algebraic fractions','Deriving and using formulae'],
      r2Key:      null,
    },
    'math-a2-equations-inequalities-s9': {
      slug:       'math-a2-equations-inequalities-s9',
      topicCode:  'M·A2',
      name:       'Equations and Inequalities',
      subject:    'math',
      stage:      9,
      strand:     'Algebra',
      strandCode: 'A',
      pricePaise: 24900,
      subtopics:  ['Constructing and solving equations','Simultaneous equations','Inequalities'],
      r2Key:      null,
    },
    'math-a3-sequences-functions-s9': {
      slug:       'math-a3-sequences-functions-s9',
      topicCode:  'M·A3',
      name:       'Sequences and Functions',
      subject:    'math',
      stage:      9,
      strand:     'Algebra',
      strandCode: 'A',
      pricePaise: 24900,
      subtopics:  ['Generating sequences','Using the nth term','Representing functions'],
      r2Key:      null,
    },
    'math-a4-graphs-s9': {
      slug:       'math-a4-graphs-s9',
      topicCode:  'M·A4',
      name:       'Graphs',
      subject:    'math',
      stage:      9,
      strand:     'Algebra',
      strandCode: 'A',
      pricePaise: 24900,
      subtopics:  ['Functions','Plotting graphs','Gradient and intercept','Interpreting graphs'],
      r2Key:      null,
    },
    'math-g1-angles-s9': {
      slug:       'math-g1-angles-s9',
      topicCode:  'M·G1',
      name:       'Angles',
      subject:    'math',
      stage:      9,
      strand:     'Geometry and Measure',
      strandCode: 'G',
      pricePaise: 24900,
      subtopics:  ['Calculating angles','Interior angles of polygons','Exterior angles of polygons','Constructions',"Pythagoras' theorem"],
      r2Key:      null,
    },
    'math-g2-shapes-measurements-s9': {
      slug:       'math-g2-shapes-measurements-s9',
      topicCode:  'M·G2',
      name:       'Shapes and Measurements',
      subject:    'math',
      stage:      9,
      strand:     'Geometry and Measure',
      strandCode: 'G',
      pricePaise: 24900,
      subtopics:  ['Circumference and area of a circle','Areas of compound shapes','Large and small units'],
      r2Key:      null,
    },
    'math-g3-position-transformation-s9': {
      slug:       'math-g3-position-transformation-s9',
      topicCode:  'M·G3',
      name:       'Position and Transformation',
      subject:    'math',
      stage:      9,
      strand:     'Geometry and Measure',
      strandCode: 'G',
      pricePaise: 24900,
      subtopics:  ['Bearings and scale drawings','Points on a line segment','Transformations','Enlarging shapes'],
      r2Key:      null,
    },
    'math-g4-volume-surface-area-symmetry-s9': {
      slug:       'math-g4-volume-surface-area-symmetry-s9',
      topicCode:  'M·G4',
      name:       'Volume, Surface Area and Symmetry',
      subject:    'math',
      stage:      9,
      strand:     'Geometry and Measure',
      strandCode: 'G',
      pricePaise: 24900,
      subtopics:  ['Calculating the volume of prisms','Calculating the surface area of triangular prisms, pyramids and cylinders','Symmetry in three-dimensional shapes'],
      r2Key:      null,
    },
    'math-s1-statistical-investigations-s9': {
      slug:       'math-s1-statistical-investigations-s9',
      topicCode:  'M·S1',
      name:       'Statistical Investigations',
      subject:    'math',
      stage:      9,
      strand:     'Statistics and Probability',
      strandCode: 'S',
      pricePaise: 24900,
      subtopics:  ['Data collection and sampling','Bias'],
      r2Key:      null,
    },
    'math-s2-probability-s9': {
      slug:       'math-s2-probability-s9',
      topicCode:  'M·S2',
      name:       'Probability',
      subject:    'math',
      stage:      9,
      strand:     'Statistics and Probability',
      strandCode: 'S',
      pricePaise: 24900,
      subtopics:  ['Mutually exclusive events','Independent events','Combined events','Chance experiments'],
      r2Key:      null,
    },
    'math-s3-interpreting-discussing-results-s9': {
      slug:       'math-s3-interpreting-discussing-results-s9',
      topicCode:  'M·S3',
      name:       'Interpreting and Discussing Results',
      subject:    'math',
      stage:      9,
      strand:     'Statistics and Probability',
      strandCode: 'S',
      pricePaise: 24900,
      subtopics:  ['Interpreting and drawing frequency polygons','Scatter graphs','Back-to-back stem-and-leaf diagrams','Calculating statistics for grouped data','Representing data'],
      r2Key:      null,
    },

    // ══════════════════════════════════════════════
    // SCIENCE — STAGE 7  (9 boosters)
    // ══════════════════════════════════════════════

    'sci-b1-cells-s7': {
      slug:       'sci-b1-cells-s7',
      topicCode:  'S·B1',
      name:       'Cells',
      subject:    'science',
      stage:      7,
      strand:     'Biology',
      strandCode: 'B',
      pricePaise: 24900,
      subtopics:  ['Plant cells','Animal cells','Specialised cells','Cells, tissues and organs'],
      r2Key:      null,
    },
    'sci-b2-grouping-identifying-organisms-s7': {
      slug:       'sci-b2-grouping-identifying-organisms-s7',
      topicCode:  'S·B2',
      name:       'Grouping and Identifying Organisms',
      subject:    'science',
      stage:      7,
      strand:     'Biology',
      strandCode: 'B',
      pricePaise: 24900,
      subtopics:  ['Characteristics of living organisms','Viruses','What is a species?','Using keys','Constructing keys'],
      r2Key:      null,
    },
    'sci-b3-microorganisms-environment-s7': {
      slug:       'sci-b3-microorganisms-environment-s7',
      topicCode:  'S·B3',
      name:       'Microorganisms in the Environment',
      subject:    'science',
      stage:      7,
      strand:     'Biology',
      strandCode: 'B',
      pricePaise: 24900,
      subtopics:  ['Microorganisms','Food chains and webs','Microorganisms and decay','Microorganisms in food webs'],
      r2Key:      null,
    },
    'sci-c1-materials-structure-s7': {
      slug:       'sci-c1-materials-structure-s7',
      topicCode:  'S·C1',
      name:       'Materials and Their Structure',
      subject:    'science',
      stage:      7,
      strand:     'Chemistry',
      strandCode: 'C',
      pricePaise: 24900,
      subtopics:  ['Solids, liquids and gases','Changes of state','Explaining changes of state','The water cycle','Atoms, elements and the Periodic Table','Compounds and formulae','Compounds and mixtures'],
      r2Key:      null,
    },
    'sci-c2-properties-materials-s7': {
      slug:       'sci-c2-properties-materials-s7',
      topicCode:  'S·C2',
      name:       'Properties of Materials',
      subject:    'science',
      stage:      7,
      strand:     'Chemistry',
      strandCode: 'C',
      pricePaise: 24900,
      subtopics:  ['Metals and non-metals','Comparing metals and non-metals','Metal mixtures','Using the properties of materials to separate mixtures','Acids and alkalis','Indicators and the pH scale'],
      r2Key:      null,
    },
    'sci-c3-changes-materials-s7': {
      slug:       'sci-c3-changes-materials-s7',
      topicCode:  'S·C3',
      name:       'Changes to Materials',
      subject:    'science',
      stage:      7,
      strand:     'Chemistry',
      strandCode: 'C',
      pricePaise: 24900,
      subtopics:  ['Simple chemical reactions','Neutralisation','Investigating acids and alkalis','Detecting chemical reactions'],
      r2Key:      null,
    },
    'sci-p1-forces-energy-s7': {
      slug:       'sci-p1-forces-energy-s7',
      topicCode:  'S·P1',
      name:       'Forces and Energy',
      subject:    'science',
      stage:      7,
      strand:     'Physics',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Gravity, weight and mass','Formation of the Solar System','Movement in space','Tides','Energy','Changes in energy','Where does energy go?'],
      r2Key:      null,
    },
    'sci-p2-earth-physics-s7': {
      slug:       'sci-p2-earth-physics-s7',
      topicCode:  'S·P2',
      name:       'Earth Physics',
      subject:    'science',
      stage:      7,
      strand:     'Physics',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Sound waves','Reflections of sound','Structure of the Earth','Changes in the Earth','Solar and lunar eclipses'],
      r2Key:      null,
    },
    'sci-p3-electricity-s7': {
      slug:       'sci-p3-electricity-s7',
      topicCode:  'S·P3',
      name:       'Electricity',
      subject:    'science',
      stage:      7,
      strand:     'Physics',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Flow of electricity','Electrical circuits','Measuring the flow of current','Conductors and insulators','Adding or removing components'],
      r2Key:      null,
    },

    // ══════════════════════════════════════════════
    // SCIENCE — STAGE 8  (9 boosters)
    // ══════════════════════════════════════════════

    'sci-b1-respiration-s8': {
      slug:       'sci-b1-respiration-s8',
      topicCode:  'S·B1',
      name:       'Respiration',
      subject:    'science',
      stage:      8,
      strand:     'Biology',
      strandCode: 'B',
      pricePaise: 24900,
      subtopics:  ['The human respiratory system','Gas exchange','Breathing','Respiration'],
      r2Key:      null,
    },
    'sci-b2-ecosystems-s8': {
      slug:       'sci-b2-ecosystems-s8',
      topicCode:  'S·B2',
      name:       'Ecosystems',
      subject:    'science',
      stage:      8,
      strand:     'Biology',
      strandCode: 'B',
      pricePaise: 24900,
      subtopics:  ['The Sonoran desert','Different ecosystems','Intruders in an ecosystem','Bioaccumulation'],
      r2Key:      null,
    },
    'sci-b3-diet-growth-s8': {
      slug:       'sci-b3-diet-growth-s8',
      topicCode:  'S·B3',
      name:       'Diet and Growth',
      subject:    'science',
      stage:      8,
      strand:     'Biology',
      strandCode: 'B',
      pricePaise: 24900,
      subtopics:  ['Nutrients','A balanced diet','Growth, development and health','Moving the body'],
      r2Key:      null,
    },
    'sci-c1-properties-materials-s8': {
      slug:       'sci-c1-properties-materials-s8',
      topicCode:  'S·C1',
      name:       'Properties of Materials',
      subject:    'science',
      stage:      8,
      strand:     'Chemistry',
      strandCode: 'C',
      pricePaise: 24900,
      subtopics:  ['Dissolving','Solutions and solubility','Planning a solubility investigation','Paper chromatography'],
      r2Key:      null,
    },
    'sci-c2-materials-structure-s8': {
      slug:       'sci-c2-materials-structure-s8',
      topicCode:  'S·C2',
      name:       'Materials and Their Structure',
      subject:    'science',
      stage:      8,
      strand:     'Chemistry',
      strandCode: 'C',
      pricePaise: 24900,
      subtopics:  ['The structure of the atom','Purity','Weather and climate','Climate and ice ages','Atmosphere and climate'],
      r2Key:      null,
    },
    'sci-c3-chemical-reactions-s8': {
      slug:       'sci-c3-chemical-reactions-s8',
      topicCode:  'S·C3',
      name:       'Chemical Reactions',
      subject:    'science',
      stage:      8,
      strand:     'Chemistry',
      strandCode: 'C',
      pricePaise: 24900,
      subtopics:  ['Exothermic reactions','Endothermic reactions','Metals and their reactions with oxygen','Reactions of metals with water','Reactions of metals with dilute acids'],
      r2Key:      null,
    },
    'sci-p1-forces-energy-s8': {
      slug:       'sci-p1-forces-energy-s8',
      topicCode:  'S·P1',
      name:       'Forces and Energy',
      subject:    'science',
      stage:      8,
      strand:     'Physics',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Forces and motion','Speed','Describing movement','Turning forces','Pressure between solids','Pressure in liquids and gases','Particles on the move'],
      r2Key:      null,
    },
    'sci-p2-light-s8': {
      slug:       'sci-p2-light-s8',
      topicCode:  'S·P2',
      name:       'Light',
      subject:    'science',
      stage:      8,
      strand:     'Physics',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Reflection','Refraction','Making rainbows','Galaxies','Rocks in space'],
      r2Key:      null,
    },
    'sci-p3-magnetism-s8': {
      slug:       'sci-p3-magnetism-s8',
      topicCode:  'S·P3',
      name:       'Magnetism',
      subject:    'science',
      stage:      8,
      strand:     'Physics',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Magnetic fields','The Earth as giant magnet','Electromagnets','Investigating electromagnets'],
      r2Key:      null,
    },

    // ══════════════════════════════════════════════
    // SCIENCE — STAGE 9  (9 boosters)
    // ══════════════════════════════════════════════

    'sci-b1-photosynthesis-carbon-cycle-s9': {
      slug:       'sci-b1-photosynthesis-carbon-cycle-s9',
      topicCode:  'S·B1',
      name:       'Photosynthesis and the Carbon Cycle',
      subject:    'science',
      stage:      9,
      strand:     'Biology',
      strandCode: 'B',
      pricePaise: 24900,
      subtopics:  ['Photosynthesis','More about photosynthesis','The carbon cycle','Climate change'],
      r2Key:      null,
    },
    'sci-b2-maintaining-life-s9': {
      slug:       'sci-b2-maintaining-life-s9',
      topicCode:  'S·B2',
      name:       'Maintaining Life',
      subject:    'science',
      stage:      9,
      strand:     'Biology',
      strandCode: 'B',
      pricePaise: 24900,
      subtopics:  ['Plants and water','Transpiration','Excretion in humans','Keeping a fetus healthy'],
      r2Key:      null,
    },
    'sci-b3-genes-inheritance-s9': {
      slug:       'sci-b3-genes-inheritance-s9',
      topicCode:  'S·B3',
      name:       'Genes and Inheritance',
      subject:    'science',
      stage:      9,
      strand:     'Biology',
      strandCode: 'B',
      pricePaise: 24900,
      subtopics:  ['Chromosomes, genes and DNA','Gametes and inheritance','Variation','Natural selection'],
      r2Key:      null,
    },
    'sci-c1-properties-materials-s9': {
      slug:       'sci-c1-properties-materials-s9',
      topicCode:  'S·C1',
      name:       'Properties of Materials',
      subject:    'science',
      stage:      9,
      strand:     'Chemistry',
      strandCode: 'C',
      pricePaise: 24900,
      subtopics:  ['Atomic structure and the Periodic Table','Trends in groups within the Periodic Table','Why elements react to form compounds','Simple and giant structures'],
      r2Key:      null,
    },
    'sci-c2-reactivity-s9': {
      slug:       'sci-c2-reactivity-s9',
      topicCode:  'S·C2',
      name:       'Reactivity',
      subject:    'science',
      stage:      9,
      strand:     'Chemistry',
      strandCode: 'C',
      pricePaise: 24900,
      subtopics:  ['Reactivity and displacement reactions','Using the reactivity series and displacement reactions','Salts','Other ways of making salts','Rearranging atoms'],
      r2Key:      null,
    },
    'sci-c3-rates-reaction-s9': {
      slug:       'sci-c3-rates-reaction-s9',
      topicCode:  'S·C3',
      name:       'Rates of Reaction',
      subject:    'science',
      stage:      9,
      strand:     'Chemistry',
      strandCode: 'C',
      pricePaise: 24900,
      subtopics:  ['Measuring the rate of reaction','Surface area and the rate of reaction','Temperature and the rate of reaction','Concentration and the rate of reaction'],
      r2Key:      null,
    },
    'sci-p1-forces-energy-s9': {
      slug:       'sci-p1-forces-energy-s9',
      topicCode:  'S·P1',
      name:       'Forces and Energy',
      subject:    'science',
      stage:      9,
      strand:     'Physics',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Density','Heat and temperature','Conservation of energy','Moving from hot to cold','Ways of transferring thermal energy','Cooling by evaporation'],
      r2Key:      null,
    },
    'sci-p2-electricity-s9': {
      slug:       'sci-p2-electricity-s9',
      topicCode:  'S·P2',
      name:       'Electricity',
      subject:    'science',
      stage:      9,
      strand:     'Physics',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Parallel circuits','Current and voltage in parallel circuits','Resistance','Practical circuits'],
      r2Key:      null,
    },
    'sci-p3-sound-space-s9': {
      slug:       'sci-p3-sound-space-s9',
      topicCode:  'S·P3',
      name:       'Sound and Space',
      subject:    'science',
      stage:      9,
      strand:     'Physics',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Loudness and pitch of sound','Interference of sound','Formation of the Moon','Nebulae','Tectonics'],
      r2Key:      null,
    },

    // ══════════════════════════════════════════════
    // COMPUTING — STAGE 7  (7 boosters)
    // ══════════════════════════════════════════════

    'comp-p1-flowcharts-selection-s7': {
      slug:       'comp-p1-flowcharts-selection-s7',
      topicCode:  'C·P1',
      name:       'Flowcharts and Selection',
      subject:    'computing',
      stage:      7,
      strand:     'Computational Thinking and Programming',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Flowcharts','Selection and logic in flowcharts','Pattern recognition and sub-routines'],
      r2Key:      null,
    },
    'comp-p2-text-programming-python-s7': {
      slug:       'comp-p2-text-programming-python-s7',
      topicCode:  'C·P2',
      name:       'Text-Based Programming and Python',
      subject:    'computing',
      stage:      7,
      strand:     'Computational Thinking and Programming',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Introduction to text-based programming','Python programming'],
      r2Key:      null,
    },
    'comp-p3-software-dev-physical-computing-s7': {
      slug:       'comp-p3-software-dev-physical-computing-s7',
      topicCode:  'C·P3',
      name:       'Software Development and Physical Computing',
      subject:    'computing',
      stage:      7,
      strand:     'Computational Thinking and Programming',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Software development and testing','Physical computing'],
      r2Key:      null,
    },
    'comp-d1-spreadsheets-modelling-s7': {
      slug:       'comp-d1-spreadsheets-modelling-s7',
      topicCode:  'C·D1',
      name:       'Spreadsheets and Modelling',
      subject:    'computing',
      stage:      7,
      strand:     'Managing Data',
      strandCode: 'D',
      pricePaise: 24900,
      subtopics:  ['Spreadsheets','Modelling'],
      r2Key:      null,
    },
    'comp-d2-databases-data-collection-s7': {
      slug:       'comp-d2-databases-data-collection-s7',
      topicCode:  'C·D2',
      name:       'Databases and Data Collection',
      subject:    'computing',
      stage:      7,
      strand:     'Managing Data',
      strandCode: 'D',
      pricePaise: 24900,
      subtopics:  ['Databases','Data collection'],
      r2Key:      null,
    },
    'comp-n1-networks-websites-data-transmission-s7': {
      slug:       'comp-n1-networks-websites-data-transmission-s7',
      topicCode:  'C·N1',
      name:       'Networks, Websites and Data Transmission',
      subject:    'computing',
      stage:      7,
      strand:     'Networks and Digital Communication',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Accessing websites','Types of network','Data transmission'],
      r2Key:      null,
    },
    'comp-s1-computer-systems-logic-ai-s7': {
      slug:       'comp-s1-computer-systems-logic-ai-s7',
      topicCode:  'C·S1',
      name:       'Computer Systems, Logic and AI',
      subject:    'computing',
      stage:      7,
      strand:     'Computer Systems',
      strandCode: 'S',
      pricePaise: 24900,
      subtopics:  ['Computer design','Types of software','Data representation','Logic gates','Automation and AI'],
      r2Key:      null,
    },

    // ══════════════════════════════════════════════
    // COMPUTING — STAGE 8  (7 boosters)
    // ══════════════════════════════════════════════

    'comp-p1-pseudocode-selection-s8': {
      slug:       'comp-p1-pseudocode-selection-s8',
      topicCode:  'C·P1',
      name:       'Pseudocode and Selection',
      subject:    'computing',
      stage:      8,
      strand:     'Computational Thinking and Programming',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Pseudocode','Selection in pseudocode','Searching algorithms'],
      r2Key:      null,
    },
    'comp-p2-programming-data-s8': {
      slug:       'comp-p2-programming-data-s8',
      topicCode:  'C·P2',
      name:       'Programming and Data',
      subject:    'computing',
      stage:      8,
      strand:     'Computational Thinking and Programming',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Conditional statements in text-based programming','Data in text-based programs','Library programs'],
      r2Key:      null,
    },
    'comp-p3-software-dev-physical-computing-s8': {
      slug:       'comp-p3-software-dev-physical-computing-s8',
      topicCode:  'C·P3',
      name:       'Software Development and Physical Computing',
      subject:    'computing',
      stage:      8,
      strand:     'Computational Thinking and Programming',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Software development','Physical computing'],
      r2Key:      null,
    },
    'comp-d1-modelling-databases-s8': {
      slug:       'comp-d1-modelling-databases-s8',
      topicCode:  'C·D1',
      name:       'Modelling and Databases',
      subject:    'computing',
      stage:      8,
      strand:     'Managing Data',
      strandCode: 'D',
      pricePaise: 24900,
      subtopics:  ['Modelling','Data and databases'],
      r2Key:      null,
    },
    'comp-n1-networks-data-transmission-security-s8': {
      slug:       'comp-n1-networks-data-transmission-security-s8',
      topicCode:  'C·N1',
      name:       'Networks and Data Transmission Security',
      subject:    'computing',
      stage:      8,
      strand:     'Networks and Digital Communication',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Types of network','Data transmission and security'],
      r2Key:      null,
    },
    'comp-s1-computer-architecture-software-data-s8': {
      slug:       'comp-s1-computer-architecture-software-data-s8',
      topicCode:  'C·S1',
      name:       'Computer Architecture, Software and Data',
      subject:    'computing',
      stage:      8,
      strand:     'Computer Systems',
      strandCode: 'S',
      pricePaise: 24900,
      subtopics:  ['Computer architectures','Types of software','Data representation'],
      r2Key:      null,
    },
    'comp-s2-logic-gates-truth-tables-ai-s8': {
      slug:       'comp-s2-logic-gates-truth-tables-ai-s8',
      topicCode:  'C·S2',
      name:       'Logic Gates, Truth Tables and AI',
      subject:    'computing',
      stage:      8,
      strand:     'Computer Systems',
      strandCode: 'S',
      pricePaise: 24900,
      subtopics:  ['Logic gates and truth tables','Augmented reality and AI'],
      r2Key:      null,
    },

    // ══════════════════════════════════════════════
    // COMPUTING — STAGE 9  (8 boosters)
    // ══════════════════════════════════════════════

    'comp-p1-pseudocode-iteration-algorithms-s9': {
      slug:       'comp-p1-pseudocode-iteration-algorithms-s9',
      topicCode:  'C·P1',
      name:       'Pseudocode, Iteration and Algorithms',
      subject:    'computing',
      stage:      9,
      strand:     'Computational Thinking and Programming',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Pseudocode','Iteration','Creating algorithms'],
      r2Key:      null,
    },
    'comp-p2-loops-data-structures-algorithms-s9': {
      slug:       'comp-p2-loops-data-structures-algorithms-s9',
      topicCode:  'C·P2',
      name:       'Loops, Data Structures and Algorithm Comparison',
      subject:    'computing',
      stage:      9,
      strand:     'Computational Thinking and Programming',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Loops in text-based programming','Programming with data','Comparing algorithms'],
      r2Key:      null,
    },
    'comp-p3-searching-testing-physical-computing-s9': {
      slug:       'comp-p3-searching-testing-physical-computing-s9',
      topicCode:  'C·P3',
      name:       'Searching, Testing and Physical Computing',
      subject:    'computing',
      stage:      9,
      strand:     'Computational Thinking and Programming',
      strandCode: 'P',
      pricePaise: 24900,
      subtopics:  ['Searching algorithms','Testing','Physical computing'],
      r2Key:      null,
    },
    'comp-d1-spreadsheets-systems-databases-s9': {
      slug:       'comp-d1-spreadsheets-systems-databases-s9',
      topicCode:  'C·D1',
      name:       'Spreadsheets, Systems and Databases',
      subject:    'computing',
      stage:      9,
      strand:     'Managing Data',
      strandCode: 'D',
      pricePaise: 24900,
      subtopics:  ['Spreadsheets and analysing data','Creating real-life systems and evaluating pre-existing spreadsheets','Creating databases'],
      r2Key:      null,
    },
    'comp-n1-topologies-transmission-network-security-s9': {
      slug:       'comp-n1-topologies-transmission-network-security-s9',
      topicCode:  'C·N1',
      name:       'Topologies, Transmission and Network Security',
      subject:    'computing',
      stage:      9,
      strand:     'Networks and Digital Communication',
      strandCode: 'N',
      pricePaise: 24900,
      subtopics:  ['Network topologies','Data transmission','Parity checks and network security'],
      r2Key:      null,
    },
    'comp-s1-computer-design-architecture-s9': {
      slug:       'comp-s1-computer-design-architecture-s9',
      topicCode:  'C·S1',
      name:       'Computer Design and Architecture',
      subject:    'computing',
      stage:      9,
      strand:     'Computer Systems',
      strandCode: 'S',
      pricePaise: 24900,
      subtopics:  ['Computer design','Computer architecture'],
      r2Key:      null,
    },
    'comp-s2-software-data-representation-logic-s9': {
      slug:       'comp-s2-software-data-representation-logic-s9',
      topicCode:  'C·S2',
      name:       'Software, Data Representation and Logic',
      subject:    'computing',
      stage:      9,
      strand:     'Computer Systems',
      strandCode: 'S',
      pricePaise: 24900,
      subtopics:  ['Computer software','Data representation','Logic circuits'],
      r2Key:      null,
    },
    'comp-s3-ai-computerisation-s9': {
      slug:       'comp-s3-ai-computerisation-s9',
      topicCode:  'C·S3',
      name:       'AI and Computerisation',
      subject:    'computing',
      stage:      9,
      strand:     'Computer Systems',
      strandCode: 'S',
      pricePaise: 24900,
      subtopics:  ['AI and computerisation'],
      r2Key:      null,
    },

  }, // end boosters


  // ─────────────────────────────────────────────────────────────
  // BUNDLES
  // ─────────────────────────────────────────────────────────────
  // type:
  //   'fivepack'  — buyer picks any 5 from same subject+stage (dynamic)
  //   'subject'   — all boosters for one subject at one stage
  //   'stage'     — all subjects at one stage
  //
  // For fivepack: itemSlugs is populated at checkout by the basket,
  //               not stored here (dynamic selection).
  // For subject/stage: itemSlugs lists every booster included.
  // ─────────────────────────────────────────────────────────────
  bundles: {

    // ── MATH 5-PACKS ─────────────────────────────
    '5pack-math-s7': {
      slug:       '5pack-math-s7',
      type:       'fivepack',
      subject:    'math',
      stage:      7,
      name:       'Mathematics Stage 7 — 5-Pack',
      pricePaise: 79900,
      maxItems:   5,
      itemSlugs:  null, // set dynamically at checkout from basket selection
    },
    '5pack-math-s8': {
      slug:       '5pack-math-s8',
      type:       'fivepack',
      subject:    'math',
      stage:      8,
      name:       'Mathematics Stage 8 — 5-Pack',
      pricePaise: 79900,
      maxItems:   5,
      itemSlugs:  null,
    },
    '5pack-math-s9': {
      slug:       '5pack-math-s9',
      type:       'fivepack',
      subject:    'math',
      stage:      9,
      name:       'Mathematics Stage 9 — 5-Pack',
      pricePaise: 79900,
      maxItems:   5,
      itemSlugs:  null,
    },

    // ── SCIENCE 5-PACKS ──────────────────────────
    '5pack-sci-s7': {
      slug:       '5pack-sci-s7',
      type:       'fivepack',
      subject:    'science',
      stage:      7,
      name:       'Science Stage 7 — 5-Pack',
      pricePaise: 79900,
      maxItems:   5,
      itemSlugs:  null,
    },
    '5pack-sci-s8': {
      slug:       '5pack-sci-s8',
      type:       'fivepack',
      subject:    'science',
      stage:      8,
      name:       'Science Stage 8 — 5-Pack',
      pricePaise: 79900,
      maxItems:   5,
      itemSlugs:  null,
    },
    '5pack-sci-s9': {
      slug:       '5pack-sci-s9',
      type:       'fivepack',
      subject:    'science',
      stage:      9,
      name:       'Science Stage 9 — 5-Pack',
      pricePaise: 79900,
      maxItems:   5,
      itemSlugs:  null,
    },

    // ── COMPUTING 5-PACKS ────────────────────────
    '5pack-comp-s7': {
      slug:       '5pack-comp-s7',
      type:       'fivepack',
      subject:    'computing',
      stage:      7,
      name:       'Computing Stage 7 — 5-Pack',
      pricePaise: 79900,
      maxItems:   5,
      itemSlugs:  null,
    },
    '5pack-comp-s8': {
      slug:       '5pack-comp-s8',
      type:       'fivepack',
      subject:    'computing',
      stage:      8,
      name:       'Computing Stage 8 — 5-Pack',
      pricePaise: 79900,
      maxItems:   5,
      itemSlugs:  null,
    },
    '5pack-comp-s9': {
      slug:       '5pack-comp-s9',
      type:       'fivepack',
      subject:    'computing',
      stage:      9,
      name:       'Computing Stage 9 — 5-Pack',
      pricePaise: 79900,
      maxItems:   5,
      itemSlugs:  null,
    },

    // ── FULL SUBJECT BUNDLES (subject × stage) ───
    'all-math-s7': {
      slug:       'all-math-s7',
      type:       'subject',
      subject:    'math',
      stage:      7,
      name:       'Complete Mathematics Stage 7',
      pricePaise: 129900,
      itemSlugs:  [
        'math-n1-integers-s7','math-n2-place-value-rounding-s7',
        'math-n3-decimals-s7','math-n4-fractions-s7',
        'math-a1-expressions-formulae-equations-s7',
        'math-g1-angles-constructions-s7','math-g2-shapes-symmetry-s7',
        'math-s1-collecting-data-s7',
      ],
    },
    'all-math-s8': {
      slug:       'all-math-s8',
      type:       'subject',
      subject:    'math',
      stage:      8,
      name:       'Complete Mathematics Stage 8',
      pricePaise: 129900,
      itemSlugs:  [
        'math-n1-integers-s8','math-n2-place-value-rounding-s8',
        'math-n3-decimals-s8','math-n4-fractions-s8',
        'math-n5-percentages-s8','math-n6-ratio-proportion-s8',
        'math-a1-expressions-formulae-equations-s8',
        'math-a2-sequences-functions-s8','math-a3-graphs-s8',
        'math-g1-angles-constructions-s8','math-g2-shapes-symmetry-s8',
        'math-g3-position-transformation-s8','math-g4-distance-area-volume-s8',
        'math-s1-collecting-data-s8','math-s2-probability-s8',
        'math-s3-interpreting-discussing-results-s8',
      ],
    },
    'all-math-s9': {
      slug:       'all-math-s9',
      type:       'subject',
      subject:    'math',
      stage:      9,
      name:       'Complete Mathematics Stage 9',
      pricePaise: 129900,
      itemSlugs:  [
        'math-n1-number-calculation-s9','math-n2-decimals-percentages-rounding-s9',
        'math-n3-fractions-s9','math-n4-ratio-proportion-s9',
        'math-a1-expressions-formulae-s9','math-a2-equations-inequalities-s9',
        'math-a3-sequences-functions-s9','math-a4-graphs-s9',
        'math-g1-angles-s9','math-g2-shapes-measurements-s9',
        'math-g3-position-transformation-s9','math-g4-volume-surface-area-symmetry-s9',
        'math-s1-statistical-investigations-s9','math-s2-probability-s9',
        'math-s3-interpreting-discussing-results-s9',
      ],
    },
    'all-sci-s7': {
      slug:       'all-sci-s7',
      type:       'subject',
      subject:    'science',
      stage:      7,
      name:       'Complete Science Stage 7',
      pricePaise: 129900,
      itemSlugs:  [
        'sci-b1-cells-s7','sci-b2-grouping-identifying-organisms-s7',
        'sci-b3-microorganisms-environment-s7',
        'sci-c1-materials-structure-s7','sci-c2-properties-materials-s7',
        'sci-c3-changes-materials-s7',
        'sci-p1-forces-energy-s7','sci-p2-earth-physics-s7','sci-p3-electricity-s7',
      ],
    },
    'all-sci-s8': {
      slug:       'all-sci-s8',
      type:       'subject',
      subject:    'science',
      stage:      8,
      name:       'Complete Science Stage 8',
      pricePaise: 129900,
      itemSlugs:  [
        'sci-b1-respiration-s8','sci-b2-ecosystems-s8','sci-b3-diet-growth-s8',
        'sci-c1-properties-materials-s8','sci-c2-materials-structure-s8',
        'sci-c3-chemical-reactions-s8',
        'sci-p1-forces-energy-s8','sci-p2-light-s8','sci-p3-magnetism-s8',
      ],
    },
    'all-sci-s9': {
      slug:       'all-sci-s9',
      type:       'subject',
      subject:    'science',
      stage:      9,
      name:       'Complete Science Stage 9',
      pricePaise: 129900,
      itemSlugs:  [
        'sci-b1-photosynthesis-carbon-cycle-s9','sci-b2-maintaining-life-s9',
        'sci-b3-genes-inheritance-s9',
        'sci-c1-properties-materials-s9','sci-c2-reactivity-s9',
        'sci-c3-rates-reaction-s9',
        'sci-p1-forces-energy-s9','sci-p2-electricity-s9','sci-p3-sound-space-s9',
      ],
    },
    'all-comp-s7': {
      slug:       'all-comp-s7',
      type:       'subject',
      subject:    'computing',
      stage:      7,
      name:       'Complete Computing Stage 7',
      pricePaise: 129900,
      itemSlugs:  [
        'comp-p1-flowcharts-selection-s7','comp-p2-text-programming-python-s7',
        'comp-p3-software-dev-physical-computing-s7',
        'comp-d1-spreadsheets-modelling-s7','comp-d2-databases-data-collection-s7',
        'comp-n1-networks-websites-data-transmission-s7',
        'comp-s1-computer-systems-logic-ai-s7',
      ],
    },
    'all-comp-s8': {
      slug:       'all-comp-s8',
      type:       'subject',
      subject:    'computing',
      stage:      8,
      name:       'Complete Computing Stage 8',
      pricePaise: 129900,
      itemSlugs:  [
        'comp-p1-pseudocode-selection-s8','comp-p2-programming-data-s8',
        'comp-p3-software-dev-physical-computing-s8',
        'comp-d1-modelling-databases-s8',
        'comp-n1-networks-data-transmission-security-s8',
        'comp-s1-computer-architecture-software-data-s8',
        'comp-s2-logic-gates-truth-tables-ai-s8',
      ],
    },
    'all-comp-s9': {
      slug:       'all-comp-s9',
      type:       'subject',
      subject:    'computing',
      stage:      9,
      name:       'Complete Computing Stage 9',
      pricePaise: 129900,
      itemSlugs:  [
        'comp-p1-pseudocode-iteration-algorithms-s9',
        'comp-p2-loops-data-structures-algorithms-s9',
        'comp-p3-searching-testing-physical-computing-s9',
        'comp-d1-spreadsheets-systems-databases-s9',
        'comp-n1-topologies-transmission-network-security-s9',
        'comp-s1-computer-design-architecture-s9',
        'comp-s2-software-data-representation-logic-s9',
        'comp-s3-ai-computerisation-s9',
      ],
    },

    // ── FULL STAGE BUNDLES (all subjects at one stage) ───
    'all-s7': {
      slug:       'all-s7',
      type:       'stage',
      stage:      7,
      name:       'Everything — Stage 7 (All Subjects)',
      pricePaise: 249900,
      itemSlugs:  [
        // Math S7 (8)
        'math-n1-integers-s7','math-n2-place-value-rounding-s7',
        'math-n3-decimals-s7','math-n4-fractions-s7',
        'math-a1-expressions-formulae-equations-s7',
        'math-g1-angles-constructions-s7','math-g2-shapes-symmetry-s7',
        'math-s1-collecting-data-s7',
        // Science S7 (9)
        'sci-b1-cells-s7','sci-b2-grouping-identifying-organisms-s7',
        'sci-b3-microorganisms-environment-s7',
        'sci-c1-materials-structure-s7','sci-c2-properties-materials-s7',
        'sci-c3-changes-materials-s7',
        'sci-p1-forces-energy-s7','sci-p2-earth-physics-s7','sci-p3-electricity-s7',
        // Computing S7 (7)
        'comp-p1-flowcharts-selection-s7','comp-p2-text-programming-python-s7',
        'comp-p3-software-dev-physical-computing-s7',
        'comp-d1-spreadsheets-modelling-s7','comp-d2-databases-data-collection-s7',
        'comp-n1-networks-websites-data-transmission-s7',
        'comp-s1-computer-systems-logic-ai-s7',
      ],
    },
    'all-s8': {
      slug:       'all-s8',
      type:       'stage',
      stage:      8,
      name:       'Everything — Stage 8 (All Subjects)',
      pricePaise: 249900,
      itemSlugs:  [
        // Math S8 (16)
        'math-n1-integers-s8','math-n2-place-value-rounding-s8',
        'math-n3-decimals-s8','math-n4-fractions-s8',
        'math-n5-percentages-s8','math-n6-ratio-proportion-s8',
        'math-a1-expressions-formulae-equations-s8',
        'math-a2-sequences-functions-s8','math-a3-graphs-s8',
        'math-g1-angles-constructions-s8','math-g2-shapes-symmetry-s8',
        'math-g3-position-transformation-s8','math-g4-distance-area-volume-s8',
        'math-s1-collecting-data-s8','math-s2-probability-s8',
        'math-s3-interpreting-discussing-results-s8',
        // Science S8 (9)
        'sci-b1-respiration-s8','sci-b2-ecosystems-s8','sci-b3-diet-growth-s8',
        'sci-c1-properties-materials-s8','sci-c2-materials-structure-s8',
        'sci-c3-chemical-reactions-s8',
        'sci-p1-forces-energy-s8','sci-p2-light-s8','sci-p3-magnetism-s8',
        // Computing S8 (7)
        'comp-p1-pseudocode-selection-s8','comp-p2-programming-data-s8',
        'comp-p3-software-dev-physical-computing-s8',
        'comp-d1-modelling-databases-s8',
        'comp-n1-networks-data-transmission-security-s8',
        'comp-s1-computer-architecture-software-data-s8',
        'comp-s2-logic-gates-truth-tables-ai-s8',
      ],
    },
    'all-s9': {
      slug:       'all-s9',
      type:       'stage',
      stage:      9,
      name:       'Everything — Stage 9 (All Subjects)',
      pricePaise: 249900,
      itemSlugs:  [
        // Math S9 (15)
        'math-n1-number-calculation-s9','math-n2-decimals-percentages-rounding-s9',
        'math-n3-fractions-s9','math-n4-ratio-proportion-s9',
        'math-a1-expressions-formulae-s9','math-a2-equations-inequalities-s9',
        'math-a3-sequences-functions-s9','math-a4-graphs-s9',
        'math-g1-angles-s9','math-g2-shapes-measurements-s9',
        'math-g3-position-transformation-s9','math-g4-volume-surface-area-symmetry-s9',
        'math-s1-statistical-investigations-s9','math-s2-probability-s9',
        'math-s3-interpreting-discussing-results-s9',
        // Science S9 (9)
        'sci-b1-photosynthesis-carbon-cycle-s9','sci-b2-maintaining-life-s9',
        'sci-b3-genes-inheritance-s9',
        'sci-c1-properties-materials-s9','sci-c2-reactivity-s9',
        'sci-c3-rates-reaction-s9',
        'sci-p1-forces-energy-s9','sci-p2-electricity-s9','sci-p3-sound-space-s9',
        // Computing S9 (8)
        'comp-p1-pseudocode-iteration-algorithms-s9',
        'comp-p2-loops-data-structures-algorithms-s9',
        'comp-p3-searching-testing-physical-computing-s9',
        'comp-d1-spreadsheets-systems-databases-s9',
        'comp-n1-topologies-transmission-network-security-s9',
        'comp-s1-computer-design-architecture-s9',
        'comp-s2-software-data-representation-logic-s9',
        'comp-s3-ai-computerisation-s9',
      ],
    },

  }, // end bundles


  // ─────────────────────────────────────────────────────────────
  // HELPER UTILITIES
  // Available on window.CM_PRODUCTS for use by checkout, subject
  // pages, and admin dashboard.
  // ─────────────────────────────────────────────────────────────

  /**
   * Get all boosters for a given subject + stage, sorted by strand then topicCode.
   * @param {string} subject  'math' | 'science' | 'computing'
   * @param {number} stage    7 | 8 | 9
   * @returns {Array}
   */
  getboosters(subject, stage) {
    return Object.values(this.boosters)
      .filter(b => b.subject === subject && b.stage === stage)
      .sort((a, b) => {
        if (a.strand !== b.strand) return a.strand.localeCompare(b.strand);
        return a.topicCode.localeCompare(b.topicCode);
      });
  },

  /**
   * Get a booster by slug.
   * @param {string} slug
   * @returns {object|null}
   */
  getBooster(slug) {
    return this.boosters[slug] || null;
  },

  /**
   * Get the subject-stage 5-pack bundle slug.
   * @param {string} subject
   * @param {number} stage
   * @returns {string}
   */
  fivepackSlug(subject, stage) {
    const subjectMap = { math: 'math', science: 'sci', computing: 'comp' };
    return `5pack-${subjectMap[subject]}-s${stage}`;
  },

  /**
   * Get the full-subject bundle slug.
   * @param {string} subject
   * @param {number} stage
   * @returns {string}
   */
  subjectBundleSlug(subject, stage) {
    const subjectMap = { math: 'math', science: 'sci', computing: 'comp' };
    return `all-${subjectMap[subject]}-s${stage}`;
  },

  /**
   * Get the full-stage bundle slug.
   * @param {number} stage
   * @returns {string}
   */
  stageBundleSlug(stage) {
    return `all-s${stage}`;
  },

  /**
   * Calculate basket price in paise.
   * 1 item  → 24900 each
   * 2–4     → 24900 each (no discount)
   * 5       → 79900 flat (5-pack price)
   * @param {number} count  number of items in basket (1–5)
   * @returns {number} pricePaise
   */
  basketPrice(count) {
    if (count <= 0) return 0;
    if (count === 5) return 79900;
    return count * 24900;
  },

  /**
   * Labels and nudge copy for basket UI — matches math.html TIERS.
   */
  basketTiers: [
    { count: 1, total: 24900,  label: '1 booster',     sub: '₹249 · single price',                       nudge: null },
    { count: 2, total: 49800,  label: '2 boosters',    sub: '₹498 · ₹249 each',                          nudge: null },
    { count: 3, total: 74700,  label: '3 boosters',    sub: '₹747 · add 2 more to save ₹196',            nudge: 'Add 2 more to unlock the 5-pack bundle!' },
    { count: 4, total: 99600,  label: '4 boosters',    sub: '₹996 · add 1 more to save ₹197',            nudge: 'One more topic unlocks the 5-pack bundle!' },
    { count: 5, total: 79900,  label: '5-pack bundle', sub: 'Best value — ₹160 per topic',               nudge: '5-pack unlocked 🎉 All 5 for ₹799' },
  ],

  /**
   * Verify a basket selection is valid for checkout.
   * Returns { ok, error } 
   */
  validateBasket(slugArray) {
    if (!slugArray || slugArray.length === 0)
      return { ok: false, error: 'No boosters selected.' };
    if (slugArray.length > 5)
      return { ok: false, error: 'Maximum 5 boosters per order.' };
    const subjects = [...new Set(slugArray.map(s => (this.boosters[s] || {}).subject))];
    const stages   = [...new Set(slugArray.map(s => (this.boosters[s] || {}).stage))];
    if (subjects.length > 1)
      return { ok: false, error: 'All boosters must be from the same subject.' };
    if (stages.length > 1)
      return { ok: false, error: 'All boosters must be from the same stage.' };
    const unknown = slugArray.filter(s => !this.boosters[s]);
    if (unknown.length)
      return { ok: false, error: `Unknown booster(s): ${unknown.join(', ')}` };
    return { ok: true };
  },

}; // end CM_PRODUCTS


// ─────────────────────────────────────────────────────────────────────────────
// QUICK SELF-CHECK  (runs once on load, logs to console — remove for prod)
// ─────────────────────────────────────────────────────────────────────────────
(function cmSelfCheck() {
  const P = window.CM_PRODUCTS;
  const total = Object.keys(P.boosters).length;

  const bySubjectStage = {};
  Object.values(P.boosters).forEach(b => {
    const k = `${b.subject}-s${b.stage}`;
    bySubjectStage[k] = (bySubjectStage[k] || 0) + 1;
  });

  console.group('[CM_PRODUCTS] Self-check');
  console.log(`Total boosters: ${total} (expected 88)`);
  console.table(bySubjectStage);

  // Verify bundle itemSlugs all exist
  let bundleErrors = 0;
  Object.values(P.bundles).forEach(b => {
    if (!b.itemSlugs) return; // fivepacks are dynamic
    b.itemSlugs.forEach(slug => {
      if (!P.boosters[slug]) {
        console.error(`Bundle ${b.slug} references unknown booster: ${slug}`);
        bundleErrors++;
      }
    });
    // Check subject bundle counts
    if (b.type === 'subject') {
      const expected = bySubjectStage[`${b.subject}-s${b.stage}`];
      if (b.itemSlugs.length !== expected) {
        console.warn(`Bundle ${b.slug}: has ${b.itemSlugs.length} items but catalogue has ${expected}`);
      }
    }
  });

  if (bundleErrors === 0) console.log('All bundle slugs valid ✓');
  if (total === 88) console.log('Booster count correct ✓');
  console.groupEnd();
})();
