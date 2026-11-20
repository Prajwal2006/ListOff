import type { CountryCode } from "./regions";

/**
 * Starter list of universities for the solo leaderboards, as "Name|STATE". Players can add any
 * institution that's missing; those are stored with is_custom = true.
 */
const IN = `
Indian Institute of Technology Bombay (IIT Bombay)|MH
Indian Institute of Technology Delhi (IIT Delhi)|DL
Indian Institute of Technology Madras (IIT Madras)|TN
Indian Institute of Technology Kanpur (IIT Kanpur)|UP
Indian Institute of Technology Kharagpur (IIT Kharagpur)|WB
Indian Institute of Technology Roorkee (IIT Roorkee)|UK
Indian Institute of Technology Guwahati (IIT Guwahati)|AS
Indian Institute of Technology Hyderabad (IIT Hyderabad)|TG
Indian Institute of Technology (BHU) Varanasi|UP
Indian Institute of Technology (ISM) Dhanbad|JH
Indian Institute of Technology Indore (IIT Indore)|MP
Indian Institute of Technology Gandhinagar (IIT Gandhinagar)|GJ
Indian Institute of Technology Ropar (IIT Ropar)|PB
Indian Institute of Technology Patna (IIT Patna)|BR
Indian Institute of Technology Bhubaneswar (IIT Bhubaneswar)|OD
Indian Institute of Technology Mandi (IIT Mandi)|HP
Indian Institute of Technology Jodhpur (IIT Jodhpur)|RJ
Indian Institute of Technology Tirupati (IIT Tirupati)|AP
Indian Institute of Technology Palakkad (IIT Palakkad)|KL
Indian Institute of Technology Dharwad (IIT Dharwad)|KA
Indian Institute of Technology Bhilai (IIT Bhilai)|CG
Indian Institute of Technology Goa (IIT Goa)|GA
Indian Institute of Technology Jammu (IIT Jammu)|JK
Indian Institute of Science (IISc) Bengaluru|KA
National Institute of Technology Tiruchirappalli (NIT Trichy)|TN
National Institute of Technology Karnataka (NITK Surathkal)|KA
National Institute of Technology Warangal (NIT Warangal)|TG
National Institute of Technology Calicut (NIT Calicut)|KL
National Institute of Technology Rourkela (NIT Rourkela)|OD
Motilal Nehru National Institute of Technology Allahabad (MNNIT)|UP
Visvesvaraya National Institute of Technology Nagpur (VNIT)|MH
Malaviya National Institute of Technology Jaipur (MNIT)|RJ
Maulana Azad National Institute of Technology Bhopal (MANIT)|MP
Sardar Vallabhbhai National Institute of Technology Surat (SVNIT)|GJ
National Institute of Technology Kurukshetra (NIT Kurukshetra)|HR
National Institute of Technology Durgapur (NIT Durgapur)|WB
National Institute of Technology Silchar (NIT Silchar)|AS
National Institute of Technology Jamshedpur (NIT Jamshedpur)|JH
National Institute of Technology Patna (NIT Patna)|BR
National Institute of Technology Raipur (NIT Raipur)|CG
National Institute of Technology Delhi (NIT Delhi)|DL
National Institute of Technology Goa (NIT Goa)|GA
National Institute of Technology Srinagar (NIT Srinagar)|JK
National Institute of Technology Hamirpur (NIT Hamirpur)|HP
Dr B R Ambedkar National Institute of Technology Jalandhar|PB
National Institute of Technology Agartala (NIT Agartala)|TR
National Institute of Technology Meghalaya (NIT Meghalaya)|ML
National Institute of Technology Puducherry (NIT Puducherry)|PY
National Institute of Technology Andhra Pradesh (NIT Andhra Pradesh)|AP
National Institute of Technology Uttarakhand (NIT Uttarakhand)|UK
National Institute of Technology Sikkim (NIT Sikkim)|SK
National Institute of Technology Manipur (NIT Manipur)|MN
National Institute of Technology Mizoram (NIT Mizoram)|MZ
National Institute of Technology Nagaland (NIT Nagaland)|NL
National Institute of Technology Arunachal Pradesh (NIT Arunachal Pradesh)|AR
International Institute of Information Technology Hyderabad (IIIT Hyderabad)|TG
International Institute of Information Technology Bangalore (IIIT Bangalore)|KA
Indraprastha Institute of Information Technology Delhi (IIIT Delhi)|DL
Indian Institute of Information Technology Allahabad (IIIT Allahabad)|UP
Birla Institute of Technology and Science, Pilani (BITS Pilani)|RJ
BITS Pilani, K K Birla Goa Campus|GA
BITS Pilani, Hyderabad Campus|TG
Indian Institute of Science Education and Research Pune (IISER Pune)|MH
Indian Institute of Science Education and Research Kolkata (IISER Kolkata)|WB
Indian Institute of Science Education and Research Mohali (IISER Mohali)|PB
Indian Institute of Science Education and Research Bhopal (IISER Bhopal)|MP
Indian Institute of Science Education and Research Thiruvananthapuram (IISER TVM)|KL
Indian Institute of Management Ahmedabad (IIM Ahmedabad)|GJ
Indian Institute of Management Bangalore (IIM Bangalore)|KA
Indian Institute of Management Calcutta (IIM Calcutta)|WB
Indian Institute of Management Lucknow (IIM Lucknow)|UP
Indian Institute of Management Kozhikode (IIM Kozhikode)|KL
Indian Institute of Management Indore (IIM Indore)|MP
All India Institute of Medical Sciences, New Delhi (AIIMS Delhi)|DL
National Law School of India University (NLSIU) Bengaluru|KA
Indian Statistical Institute (ISI) Kolkata|WB
University of Delhi|DL
Jawaharlal Nehru University (JNU)|DL
Jamia Millia Islamia|DL
Delhi Technological University (DTU)|DL
Netaji Subhas University of Technology (NSUT)|DL
Guru Gobind Singh Indraprastha University (GGSIPU)|DL
Banaras Hindu University (BHU)|UP
Aligarh Muslim University (AMU)|UP
University of Lucknow|UP
Dr. A.P.J. Abdul Kalam Technical University (AKTU)|UP
Amity University, Noida|UP
Shiv Nadar University|UP
University of Hyderabad|TG
Osmania University|TG
Jawaharlal Nehru Technological University Hyderabad (JNTUH)|TG
Jadavpur University|WB
University of Calcutta|WB
Presidency University, Kolkata|WB
University of Mumbai|MH
Savitribai Phule Pune University|MH
COEP Technological University, Pune|MH
Veermata Jijabai Technological Institute (VJTI) Mumbai|MH
Institute of Chemical Technology (ICT) Mumbai|MH
Symbiosis International University|MH
NMIMS University, Mumbai|MH
Anna University|TN
University of Madras|TN
PSG College of Technology|TN
Vellore Institute of Technology (VIT)|TN
SRM Institute of Science and Technology|TN
Amrita Vishwa Vidyapeetham|TN
SASTRA Deemed University|TN
Andhra University|AP
Jawaharlal Nehru Technological University Kakinada (JNTUK)|AP
Bangalore University|KA
University of Mysore|KA
Visvesvaraya Technological University (VTU)|KA
Manipal Academy of Higher Education|KA
Christ University, Bengaluru|KA
PES University|KA
RV College of Engineering|KA
BMS College of Engineering|KA
M S Ramaiah Institute of Technology|KA
Jain University|KA
University of Kerala|KL
Cochin University of Science and Technology (CUSAT)|KL
College of Engineering Trivandrum (CET)|KL
Panjab University|CH
Punjab Engineering College (PEC) Chandigarh|CH
Thapar Institute of Engineering and Technology|PB
Lovely Professional University (LPU)|PB
Chandigarh University|PB
Ashoka University|HR
O.P. Jindal Global University|HR
Kurukshetra University|HR
Gujarat University|GJ
Gujarat Technological University (GTU)|GJ
Nirma University|GJ
Dhirubhai Ambani University (DA-IICT)|GJ
University of Rajasthan|RJ
Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)|MP
Devi Ahilya Vishwavidyalaya, Indore|MP
Kalinga Institute of Industrial Technology (KIIT)|OD
Utkal University|OD
Patna University|BR
Gauhati University|AS
Tezpur University|AS
Ranchi University|JH
Birla Institute of Technology, Mesra|JH
Goa University|GA
University of Jammu|JK
University of Kashmir|JK
Himachal Pradesh University|HP
HNB Garhwal University|UK
Pandit Ravishankar Shukla University|CG
North-Eastern Hill University (NEHU)|ML
Pondicherry University|PY
Sikkim University|SK
Manipur University|MN
Tripura University|TR
Mizoram University|MZ
Nagaland University|NL
Rajiv Gandhi University|AR
`;

const US = `
Massachusetts Institute of Technology (MIT)|MA
Harvard University|MA
Boston University|MA
Northeastern University|MA
Boston College|MA
Tufts University|MA
University of Massachusetts Amherst|MA
Stanford University|CA
University of California, Berkeley|CA
University of California, Los Angeles (UCLA)|CA
California Institute of Technology (Caltech)|CA
University of Southern California (USC)|CA
University of California, San Diego|CA
University of California, Davis|CA
University of California, Irvine|CA
University of California, Santa Barbara|CA
San Jose State University|CA
Princeton University|NJ
Rutgers University|NJ
Stevens Institute of Technology|NJ
Yale University|CT
University of Connecticut|CT
Columbia University|NY
Cornell University|NY
New York University (NYU)|NY
University of Rochester|NY
Syracuse University|NY
Stony Brook University|NY
University at Buffalo|NY
Rensselaer Polytechnic Institute|NY
University of Pennsylvania|PA
Carnegie Mellon University|PA
Pennsylvania State University|PA
University of Pittsburgh|PA
Drexel University|PA
Brown University|RI
University of Rhode Island|RI
Dartmouth College|NH
University of New Hampshire|NH
Duke University|NC
University of North Carolina at Chapel Hill|NC
North Carolina State University|NC
Wake Forest University|NC
Johns Hopkins University|MD
University of Maryland, College Park|MD
Georgetown University|DC
George Washington University|DC
Howard University|DC
University of Virginia|VA
Virginia Tech|VA
George Mason University|VA
Georgia Institute of Technology|GA
Emory University|GA
University of Georgia|GA
Georgia State University|GA
University of Florida|FL
Florida State University|FL
University of Miami|FL
University of Central Florida|FL
Vanderbilt University|TN
University of Tennessee, Knoxville|TN
University of Michigan|MI
Michigan State University|MI
Northwestern University|IL
University of Chicago|IL
University of Illinois Urbana-Champaign|IL
Illinois Institute of Technology|IL
Purdue University|IN
Indiana University Bloomington|IN
University of Notre Dame|IN
Ohio State University|OH
Case Western Reserve University|OH
University of Cincinnati|OH
University of Wisconsin-Madison|WI
University of Minnesota|MN
University of Iowa|IA
Iowa State University|IA
Washington University in St. Louis|MO
University of Missouri|MO
University of Texas at Austin|TX
Texas A&M University|TX
Rice University|TX
University of Texas at Dallas|TX
University of Houston|TX
Texas Tech University|TX
Arizona State University|AZ
University of Arizona|AZ
University of Colorado Boulder|CO
Colorado School of Mines|CO
University of Utah|UT
Brigham Young University|UT
University of Washington|WA
Washington State University|WA
University of Oregon|OR
Oregon State University|OR
Tulane University|LA
Louisiana State University|LA
University of Alabama|AL
Auburn University|AL
University of Kentucky|KY
Clemson University|SC
University of South Carolina|SC
University of Kansas|KS
Kansas State University|KS
University of Nebraska-Lincoln|NE
University of Oklahoma|OK
University of Arkansas|AR
University of Mississippi|MS
University of New Mexico|NM
University of Nevada, Las Vegas|NV
University of Nevada, Reno|NV
University of Hawaii at Manoa|HI
University of Alaska Fairbanks|AK
University of Delaware|DE
University of Maine|ME
University of Vermont|VT
West Virginia University|WV
University of Idaho|ID
University of Montana|MT
University of Wyoming|WY
North Dakota State University|ND
South Dakota State University|SD
`;

function parse(src: string, country: CountryCode) {
  return src
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [name, stateCode] = l.split("|");
      return { name: name.trim(), stateCode: stateCode.trim(), country };
    });
}

export const UNIVERSITIES = [...parse(IN, "IN"), ...parse(US, "US")];
