import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, Send, CheckCircle, AlertCircle, Info } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LevelDescription {
  level: number;
  description: string;
}

interface Competency {
  id: string;
  name: string;
  shortName: string;
  guidance: string;
  levels: LevelDescription[];
  whyKey: string;
  additionalKey: string;
  levelKey: string;
}

interface CompetencyAnswer {
  level: number | null;
  why: string;
  additional: string;
}

interface FormData {
  email: string;
  name: string;
  campus: string;
  competencies: Record<string, CompetencyAnswer>;
  urgentAttention: string;
  escalation: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_LABELS = ['NONE', 'NOVICE', 'BASIC', 'STABLE', 'SKILLFUL', 'EXPERT', 'LEAD', 'MASTER'];

const CAMPUSES = [
  'Dantewada', 'Jashpur', 'Raigarh', 'Himachal (Eternal)',
  'Dharamshala', 'Kishanganj', 'Udaipur', 'Pune', 'Sarjapur',
];

const DRAFT_KEY = 'campus-pulse-evaluation-draft';

const COMPETENCIES: Competency[] = [
  {
    id: 'meditation',
    name: 'Meditation (Ana Pana for most and students attending Vipassana Camps)',
    shortName: 'Meditation',
    guidance: 'Evaluate the campus community\'s engagement with Vipassana and Anapana meditation practices, including team and student participation rates.',
    levelKey: 'Meditation (Ana Pana for most and students attending Vipassana Camps) ',
    whyKey: 'Why have you marked Meditation level for this bracket?',
    additionalKey: 'Is there anything else you would like to share that is not covered in the above competency levels for Meditation bracket?',
    levels: [
      { level: 0, description: 'The team has not experienced/ does not have a buyin in vipasana.' },
      { level: 1, description: '75 percent of the team members have experienced vipassana course. The team actively encourages students to attend a course. The community practices anapan on a daily basis.' },
      { level: 2, description: '75 percent of the team members have experienced vipassana course. The team actively encourages students to attend a course. 20 percent of the students have attended the course and are The community practices anapan on a daily basis.' },
      { level: 3, description: '100 percent of the team members have experienced vipassana course. The team actively encourages students to attend a course. 40 percent of the students have attended the course and they practice vippasana on a daily basis while the rest of the community practices anapan on a daily basis.' },
      { level: 4, description: '100 percent of the team members have experienced vipassana course. The team actively encourages students to attend a course. 50 percent of the students have attended the course and they practice vippasana on a daily basis while the rest of the community practices anapan on a daily basis.' },
      { level: 5, description: '100 percent of the team members have experienced vipassana course. The team actively encourages students to attend a course. 60 percent of the students have attended the course and they practice vippasana on a daily basis while the rest of the community practices anapan on a daily basis. 50% of the team members have served at least one of the Vipassana course.' },
      { level: 6, description: '100 percent of the team members have experienced vipassana course. The team actively encourages students to attend a course. 75 percent of the students have attended the course and they practice vippasana on a daily basis while the rest of the community practices anapan on a daily basis. 75% of the team members have served at least one of the Vipassana course.' },
      { level: 7, description: '100 percent of the team members and 90% of the students have attended at least one 10 days vipasana course. The campus is grounded through consistent daily vipasana meditation. 100% of the team members have served at least one of the Vipassana course.' },
    ],
  },
  {
    id: 'nutrition',
    name: 'Nutrition Supplementation + Yoga/Weight Training',
    shortName: 'Nutrition & Yoga',
    guidance: 'Assess the campus\'s structured approach to physical health, including nutrition awareness, supplementation practices, and daily exercise routines.',
    levelKey: 'Nutrition Supplementation + Yoga/Weight Training',
    whyKey: 'Why have you marked this Nutrition Supplementation + Yoga/Weight Training for this bracket?',
    additionalKey: 'Is there anything else you would like to share that is not covered in the above competency levels for Nutrition Supplementation + Yoga/Weight Training bracket?',
    levels: [
      { level: 0, description: 'No structured approach to nutrition or physical training. Minimal or no awareness of supplementation or exercise practices.' },
      { level: 1, description: 'Students demonstrate the ability to complete a 10-minute daily routine of body-weight exercises and 20 mins yoga poses for flexibility. They recognize essential nutrients in foods and can read basic food labels to identify sources of protein and fiber.' },
      { level: 2, description: 'Students demonstrate the ability to complete a 15-minute daily routine of body-weight exercises and yoga poses for flexibility. They recognize essential nutrients in foods and can read basic food labels to identify sources of protein, fiber, vitamin and minerals.' },
      { level: 3, description: 'Students complete a structured 25-minute routine alternating between body-weight strength exercises and flexibility-focused yoga sessions. They actively maintain a two-week food log and use it to make informed decisions about adding basic supplements like multivitamins.' },
      { level: 4, description: 'Students adhere to a 30-minute daily fitness routine that incorporates both body-weight exercises and yoga, consistently improving form and endurance. They create a basic supplementation plan with guidance and track their intake, adjusting for better energy and focus.' },
      { level: 5, description: 'Students follow a structured 35-minute regimen with intermediate body-weight exercises and yoga, focusing on core strengthening and balance. They track and assess their dietary intake for key nutrients over three months, demonstrating understanding of nutrient timing and recovery needs.' },
      { level: 6, description: 'Students sustain a 40-minute advanced exercise routine that includes yoga, strength, and endurance training. They design a personalized nutrition and supplementation plan, adjusting nutrient intake based on fitness goals and conducting regular self-assessments every two months.' },
      { level: 7, description: 'The campus has implemented exemplary practices to promote health in the most efficient way possible. A key part of this is a nutrition-focused diet that delivers maximum nutritional value in a cost-effective manner through microgreens or other alternatives. Students also engage in daily strength training exercises using body weight for 10-15 minutes, alongside flexibility-building yoga exercises.' },
    ],
  },
  {
    id: 'houses',
    name: 'Houses and Reward Systems',
    shortName: 'Houses & Rewards',
    guidance: 'Evaluate how effectively the house and reward systems are used to build community, encourage positive behaviours, and foster a sense of belonging among students.',
    levelKey: 'Houses and Reward Systems',
    whyKey: 'Why have you marked Houses and Reward Systems level for this bracket?',
    additionalKey: 'Is there anything else you would like to share that is not covered in the above competency levels for Houses and Reward Systems bracket?',
    levels: [
      { level: 0, description: 'There are either no houses and rewards system or they aren\'t actively being reinforced' },
      { level: 1, description: 'There are houses and sometimes there are interhouse events/quizzes. There is no appreciation of efforts through continuous reward system.' },
      { level: 2, description: 'There are houses and a reward system that the team leverages frequently. However, the implementation leans towards either mostly consequences or mostly rewards. Sense of belonging within houses is limited.' },
      { level: 3, description: 'The team utilizes the house and reward systems to a large extent both to encourage positive behaviours and to discourage negative behaviours. Students strive for their individual points to be balanced. Sense of belonging within houses is limited and students live together/do tasks together but rarely hold each other accountable to useful behaviours.' },
      { level: 4, description: 'The team utilizes the house and reward systems to a large extent both to encourage positive behaviours and to discourage negative behaviours, as well as to build a fun learning environment on campus through inter house quizzes etc. Sense of belonging within houses is moderate and students sometimes hold each other accountable to useful behaviours.' },
      { level: 5, description: 'The team utilizes the house and reward systems to encourage high rigor positive behaviours and to discourage negative behaviours. The campus has a lot of fun chaos and high rigor build through inter house competition/individual rewards etc. Every Student feels a strong sense of community within their houses, they take pride in winning their house trophy.' },
      { level: 6, description: 'The house leaders enthusiastically continuing the house and reward system on campus, taking full ownership and showing great excitement. Every student feels a strong sense of belonging within their houses and takes pride in competing for the house trophy.' },
      { level: 7, description: 'The House strives to build and leave their legacy by building something unthinkable. The House is a living breathing organism with a character of its own. No external energy is needed to build or sustain the houses anymore.' },
    ],
  },
  {
    id: 'etiocracy',
    name: 'Etiocracy, Co-Creation & Ownership',
    shortName: 'Etiocracy & Ownership',
    guidance: 'Assess the degree to which students are involved in decision-making, co-creation, and ownership of campus operations and challenges.',
    levelKey: 'Etiocracy, Co-Creation & Ownership',
    whyKey: 'Why have you marked Etiocracy, Co-Creation & Ownership level for this bracket?',
    additionalKey: 'Is there anything else you would like to share that is not covered in the Etiocracy, Co-Creation & Ownership competency levels for this bracket?',
    levels: [
      { level: 0, description: 'Team makes most decisions, students have minimal involvement.' },
      { level: 1, description: 'Team involves student leaders in 20% of the decision-making processes. Students are encouraged to share ideas but have limited decision-making power.' },
      { level: 2, description: 'Team involves student leaders in 40% of the decision-making processes. Students are given small projects to lead with team supervision.' },
      { level: 3, description: 'Team and student leaders co-create in 60% of the decision-making processes. Students take charge of specific roles and responsibilities with minimal supervision.' },
      { level: 4, description: 'Team and students leaders co-create in 80% of the decision-making processes. Students are empowered to make decisions in their roles, and the team supports and guides as needed.' },
      { level: 5, description: 'Team and student leaders coown campus challenges and co-create in 95% of the decision-making processes. Students are fully empowered and have significant autonomy in their roles, Students are equal owners of the campus.' },
      { level: 6, description: 'Team and students are equal partners in 100% of the decision-making processes. Students are fully empowered, exhibit leadership, and continuously contribute to the growth and improvement of the campus through active co-creation.' },
      { level: 7, description: 'The campus is actively able to share the magic of etiocracy: co-creation and ownership to the world. The campus functions like a business unit and manages to subsidise a good percentage of their running costs.' },
    ],
  },
  {
    id: 'campusInteractions',
    name: 'Campus interactions',
    shortName: 'Campus Interactions',
    guidance: 'Evaluate the quality and depth of interactions between the team and students, including collaboration, shared activities, and mutual support.',
    levelKey: 'Campus interactions',
    whyKey: 'Why have you marked this level for Campus interactions bracket?',
    additionalKey: 'Is there anything else you would like to share that is not covered in the Campus interactions competency levels for this bracket?',
    levels: [
      { level: 0, description: 'Team focuses only on the work assigned to - Works mostly from their rooms. The team does not demonstrate high professionalism.' },
      { level: 1, description: 'Team demonstrates professionalism but the interaction with students are occasional - and only during assigned tasks.' },
      { level: 2, description: 'Team interacts with students during work hours and participates in some group activities.' },
      { level: 3, description: 'Team frequently interacts with students, participates in some shared tasks, and engages in informal discussions.' },
      { level: 4, description: 'Team navigates their differences with a lot of love, understanding and open heart. The team collaborates with students on projects, attends joint sessions, and participates in social activities.' },
      { level: 5, description: 'Team supports each other to grow :) navigates their differences with a lot of love, understanding and open heart. Team works mostly with students and spends time as co-learners - practice sessions, having fun together, and participating in campus work like kitchen turns, morning exercises, and cleaning duties alongside students.' },
      { level: 6, description: 'Entire team and students work together and are there for each other for any challenge that either of them faces. The team feels like they can depend on the community they have built.' },
      { level: 7, description: 'Team feels nourished on the campus. They feel a sense of belonging, feels loved and safe on the campus. They gain energy by being on the campus. They learn and grow both personally and professionally.' },
    ],
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    shortName: 'Gratitude',
    guidance: 'Assess the depth of gratitude culture on campus — from initial awareness through to alumni actively giving back to the NavGurukul community.',
    levelKey: 'Gratitude',
    whyKey: 'Why have you marked Gratitude level for this bracket?',
    additionalKey: 'Is there anything else you would like to share that is not covered in the Gratitude competency levels for this bracket?',
    levels: [
      { level: 0, description: 'The team has a deep sense of gratitude towards everything that has made it possible for us to be of support in students journey. A budding sense of gratitude starts to develop among students, primarily through understanding the value of their surroundings and opportunities.' },
      { level: 1, description: 'Students begin to notice the efforts that go into maintaining the campus and express simple gratitude towards those efforts. They start understanding that their learning is made possible by the contributions of many.' },
      { level: 2, description: 'Gratitude begins to translate into action. Students actively participate in keeping the campus environment clean and well-maintained, treating the infrastructure as if it were their own.' },
      { level: 3, description: 'Students start to contribute/support each other, the team and the ecosystem around them more intentionally, lifting one another up during challenging times. Students are keen to support each other due to the love and gratitude that they hold for each other and the campus.' },
      { level: 4, description: 'Students actively help new learners with genuine interest, offering guidance in studies or coding challenges. They take pride in creating a positive environment where everyone feels supported.' },
      { level: 5, description: 'Students begin to plan how they can support future batches once they graduate. They express a commitment to contribute to the NavGurukul community, whether through financial support, mentorship, or volunteering.' },
      { level: 6, description: 'Alumni engage with each other and the students to actively create and identify ways of supporting and driving the campus and the larger NavGurukul community in general.' },
      { level: 7, description: 'A strong sense of gratitude among its members, towards one another, towards Navgurukul, and towards everything that makes the campus possible. Alumni are deeply involved in giving back through financial contributions, mentorship, and supporting placements.' },
    ],
  },
  {
    id: 'hackathons',
    name: 'Hackathons',
    shortName: 'Hackathons',
    guidance: 'Evaluate the level of excitement, rigor, and genuine learning that students bring to hackathons, and the quality of solutions they build.',
    levelKey: 'Hackathons',
    whyKey: 'Why have you marked Hackathons level for this bracket?',
    additionalKey: 'Is there anything else you would like to share that is not covered in the Hackathons competency levels for this bracket?',
    levels: [
      { level: 0, description: 'Only team participates in hackathons' },
      { level: 1, description: 'There is no excitement or rigor about hackathon. Many students attend just because they have to, which often leads to frustration. They end up copying and pasting from ChatGPT.' },
      { level: 2, description: 'Some students show initial interest, but most still lack confidence and avoid deeper involvement. Copy-pasting code is common, and genuine learning is sporadic. Only about 20-30% of students actively attempt projects.' },
      { level: 3, description: 'A moderate level of excitement is present. Some students begin exploring solutions independently, but many still rely on external resources like ChatGPT. Only 50-60% of students genuinely push their limit.' },
      { level: 4, description: 'The hackathon atmosphere is highly competitive yet supportive, with a focus on learning through doing. Most students are eager to challenge themselves and learn from failures. 90% of students are fully engaged.' },
      { level: 5, description: 'The community - Students and the team participate in the Hackathons with high rigor and high excitement - where everyone looks forward to learning something new, without fear of failing.' },
      { level: 6, description: 'The community leverages their tech skills and their context and attempts to build innovative tech solutions for themselves and the ecosystem around them.' },
      { level: 7, description: 'The campus community has developed a sense of gratification and love from building inclusive, useful and innovative solutions. They actively identify and solve any community challenges by leveraging their skills. Some of these projects also later become startups from the campus.' },
    ],
  },
  {
    id: 'english',
    name: 'English Communication & Comprehension',
    shortName: 'English Communication',
    guidance: 'Assess the English proficiency of both the team and students, including usage during academic and non-academic time, and support systems for those struggling.',
    levelKey: 'English Communication & Comprehension',
    whyKey: 'Why have you marked English Communication & Comprehension level for this bracket?',
    additionalKey: 'Is there anything else you would like to share that is not covered in the English Communication & Comprehension competency levels for this bracket?',
    levels: [
      { level: 0, description: 'The team does not speak in English. Student Proficiency not established.' },
      { level: 1, description: 'Team Proficiency: Speaks in English at least 80% of the time. Student Proficiency: Try to speak in English but do not use it during academic time.' },
      { level: 2, description: 'Team Proficiency: Speaks in English at least 80% of the time. Student Proficiency: Use English occasionally during academic time, but still rely on their native language frequently.' },
      { level: 3, description: 'Team Proficiency: Speaks in English at least 85% of the time. Student Proficiency: Use English more frequently during academic time, starting to use basic English outside academic activities.' },
      { level: 4, description: 'Team Proficiency: Speaks in English at least 90% of the time. Student Proficiency: Speak in English at least 90% of the time, including non-academic time. There are strong support systems for those struggling with English.' },
      { level: 5, description: 'Team Proficiency: Speaks in English almost exclusively. Student Proficiency: Consistently use English during both academic and non-academic times, showing improved fluency and vocabulary. Students are able to have fun in English!' },
      { level: 6, description: 'Team Proficiency: English is the primary language of communication. Student Proficiency: Use English extensively, demonstrating advanced proficiency and confidence in various contexts. Any new student who enters the campus is supported and learns to speak in English within few months.' },
      { level: 7, description: 'Team Proficiency: English is the primary language, with other languages used rarely. Student Proficiency: Highly interested in English, learning new words daily. Students are conscious and have a strong belief that English communication is one of the important pieces to get an empowered life.' },
    ],
  },
  {
    id: 'learningEnvironment',
    name: 'Learning Environment & Peer Support',
    shortName: 'Learning & Peer Support',
    guidance: 'Evaluate the quality of the learning environment, pair programming culture, "learning by doing" practices, and the extent of peer support among students.',
    levelKey: 'Learning Environment & Peer Support',
    whyKey: 'Why have you marked Learning Environment & Peer Support level for this bracket?',
    additionalKey: 'Is there anything else you would like to share that is not covered in the Learning Environment & Peer Support competency levels for this bracket?',
    levels: [
      { level: 0, description: 'Team does not put in the effort to bond with students or keep the campus alive (Alive: high fun - high rigor). The team does not proactively do pair programming with students for 50 percent of their time. Peer support is practically non-existent.' },
      { level: 1, description: 'Pair programming is introduced, Team does pair programming with students 50 percent of the time. The concept of "learning by doing" is acknowledged but not actively practiced. Peer support is minimal.' },
      { level: 2, description: 'The team pairs with students 50% of the time and begins to build a deeper understanding of "learning how to learn" among students. Around 40-50% of the students are actively engaged in "learning by doing" practices. Roughly 50% of students support each other.' },
      { level: 3, description: 'The team is deeply involved with students through pair programming and active engagement in collaborative activities. Almost all students (80% or more) are fully invested in "learning by doing". Peer support is a natural, integrated part of the campus culture.' },
      { level: 4, description: 'The team is deeply involved with students through pair programming and active engagement in collaborative activities. Almost all students (90% or more) are fully invested in "learning by doing." Peer support is a natural, integrated part of the campus culture, with nearly all students (90% or more) helping each other regularly.' },
      { level: 5, description: 'The team acts as thought partners and visionaries, intervening in complex cases. All students (100%) are fully immersed in "learning by doing" and "learning how to learn." They not only solve their own learning challenges but also mentor their peers.' },
      { level: 6, description: 'Every member of the campus community has extraordinary belief in themselves and the community. Everyone is capable of identifying pedagogical challenges and constructing solutions. The campus demonstrates 21st century skills like resilience, adapting to failures, self awareness, empathy, metacognition to a major extent.' },
      { level: 7, description: 'Every member of the campus community has extraordinary belief in themselves and the community. Each member demonstrates higher order 21st century skills like resilience, navigating through failures, self awareness, ability to reflect, metacognition, empathy - thus demonstrating "learning how to learn" in an extraordinary way.' },
    ],
  },
  {
    id: 'processPrinciples',
    name: 'Process Principles Understanding & Implementation',
    shortName: 'Process Principles',
    guidance: 'Assess how well the team and students understand and implement the 5 process principles: Documentation, Build in Public, Deadline Management, Feedback Loops, and Team of Teams.',
    levelKey: 'Process Principles Understanding & Implementation',
    whyKey: 'Why have you marked Process Principles Understanding & Implementation level for this bracket?',
    additionalKey: 'Is there anything else you would like to share that is not covered in the Process Principles Understanding & Implementation competency levels for this bracket?',
    levels: [
      { level: 0, description: 'The team does not follow 5 process principles.' },
      { level: 1, description: 'The team is on L7 and follows all the process principles religiously in their everyday routine. While making an attempt to support students reach L7.' },
      { level: 2, description: '90 percent of the council members and more than 50 percent of the students are able to: Documentation & Active Knowledge Base, Build in Public, Manage deadlines (Meet 75% of their deadlines on their own without requiring follow-up).' },
      { level: 3, description: 'All the council members and more than 75 percent of the students are able to do everything in L2. Additionally build an environment of constructive feedback, creating feedback loops between the community. Meet 75% of their deadlines independently.' },
      { level: 4, description: 'All the council members and more than 90 percent of the students are able to do everything in L3. Meet 95% of their deadlines independently. All council members and 50 percent of the students have their own actively supporting team of team.' },
      { level: 5, description: 'All council members and 95 percent of the students are able to do everything in L4. Additionally All council members and 75 percent Students have their own actively supporting team of team. The community is able to identify inefficiencies in the system and ask for support.' },
      { level: 6, description: 'All council members and 95 percent of the students are able to do everything in L4. Additionally Everyone in the community have their own actively supporting team of team. The community is able to identify inefficiencies in the system, invent/adopt and simplify.' },
      { level: 7, description: 'The campus community is able to do all process principles at the highest level. Proactively identifies inefficiencies, implements simple, scalable solutions, and leads innovation efforts. Each partner in the campus should have an extended team of at least 2 people supporting the partner or the campus or NG in general.' },
    ],
  },
  {
    id: 'lifeSkills',
    name: 'Life Skills Implementation',
    shortName: 'Life Skills',
    guidance: 'Evaluate whether English class and other campus spaces follow the Activity Design & Facilitation framework: 1) Placements+AI (80%), 2) Inner work (10%), 3) Ecology, Gender (10%).',
    levelKey: 'Life Skills Implementation \n\n(is english class + other other spaces on campus follow the framework of Activity Design and faciliation?\n\n1) Placements+AI (80%)\n2) Inner work, (10%)\n3) Ecology, Gender (10%) ',
    whyKey: 'Why have you marked Life Skills Implementation  level for this bracket?',
    additionalKey: 'Is there anything else you would like to share that is not covered in the Life Skills Implementation  competency levels for this bracket?',
    levels: [
      { level: 0, description: 'The learning is not happening in english or other spaces as per the needs of the students on campus.' },
      { level: 1, description: 'The learning is happening in english or other spaces in the direction but designing very simple, basic activities. Associates are at very initial levels of competency framework.' },
      { level: 2, description: 'The learning is happening in english or other spaces in the direction designing very simple, basic activities. Associates are at very initial levels of competency framework.' },
      { level: 3, description: 'The learning is happening in english or other spaces in the right direction where associates can independently understand the needs of the campus and take care of learning in that direction with some amount of supervision. Associates are able to guide Council Coaches in designing and facilitation.' },
      { level: 4, description: 'The learning is happening in english or other spaces in the right direction where associates and council can independently understand the needs of the campus and take care of learning in that direction with very little supervision. Associates are leading spaces to guide other campuses regularly in this direction.' },
      { level: 5, description: 'The learning is happening in english or other spaces in the right direction where associates are role modelling councils to upskill in design and facilitation in creating portfolios of their best designs as a part of their learning during the process. Associates are competent to guide volunteers, external interns to lead the vision of life skills in NavGurukul.' },
      { level: 6, description: 'The learning in the campus is role modelling experience for other campuses.' },
      { level: 7, description: 'The lifeskills/english plan is aligned to the needs of students on the campus. The plan has an interesting entanglement of lifeskills as the core theme which enables required english practice/growth. 100 percent of the students are engaged/excited/amazed/moved by the lifeskills and english theme.' },
    ],
  },
];

// ─── Helper: build initial form data ─────────────────────────────────────────

function buildInitialFormData(): FormData {
  const competencies: Record<string, CompetencyAnswer> = {};
  COMPETENCIES.forEach(c => {
    competencies[c.id] = { level: null, why: '', additional: '' };
  });
  return { email: '', name: '', campus: '', competencies, urgentAttention: '', escalation: '' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface LevelSelectorProps {
  selected: number | null;
  onChange: (level: number) => void;
  levels: LevelDescription[];
}

function LevelSelector({ selected, onChange, levels }: LevelSelectorProps) {
  return (
    <div>
      {/* Button row */}
      <div className="flex gap-2 flex-wrap">
        {levels.map(({ level }) => {
          const isSelected = selected === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`flex flex-col items-center w-14 py-2 rounded-lg border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                isSelected
                  ? 'bg-blue-700 border-blue-700 text-white shadow-md'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <span className="text-lg font-bold leading-none">{level}</span>
              <span className={`text-[9px] font-semibold mt-1 tracking-wide ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                {LEVEL_LABELS[level]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected level description */}
      {selected !== null && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-800 mb-1">Level {selected} — {LEVEL_LABELS[selected]}</p>
          <p className="text-sm text-blue-700 leading-relaxed">
            {levels.find(l => l.level === selected)?.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EvaluationForm() {
  // step 0 = basic info, steps 1-11 = competencies, step 12 = urgent issues
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(buildInitialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [draftSaved, setDraftSaved] = useState(false);

  const TOTAL_STEPS = 13; // 0 (basic) + 11 competencies + 1 urgent = 13 steps (0-12)
  const LAST_STEP = 12;

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const updateBasicField = (field: keyof Pick<FormData, 'email' | 'name' | 'campus'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const updateCompetency = (id: string, field: keyof CompetencyAnswer, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      competencies: {
        ...prev.competencies,
        [id]: { ...prev.competencies[id], [field]: value },
      },
    }));
    setValidationErrors([]);
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch {
      // ignore
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────────

  const validateCurrentStep = (): string[] => {
    const errors: string[] = [];
    if (step === 0) {
      if (!formData.email.trim()) errors.push('Email is required.');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push('Please enter a valid email address.');
      if (!formData.name.trim()) errors.push('Name is required.');
      if (!formData.campus) errors.push('Please select a campus.');
    } else if (step >= 1 && step <= 11) {
      const comp = COMPETENCIES[step - 1];
      const ans = formData.competencies[comp.id];
      if (ans.level === null) errors.push('Please select a level (0–7).');
      if (!ans.why.trim()) errors.push('"Why have you marked this level?" is required.');
    } else if (step === LAST_STEP) {
      // urgent fields are optional — no validation needed
    }
    return errors;
  };

  const validateAll = (): string[] => {
    const errors: string[] = [];
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.push('Valid email is required (Step 0).');
    if (!formData.name.trim()) errors.push('Name is required (Step 0).');
    if (!formData.campus) errors.push('Campus selection is required (Step 0).');
    COMPETENCIES.forEach((comp, idx) => {
      const ans = formData.competencies[comp.id];
      if (ans.level === null) errors.push(`Level selection required for "${comp.shortName}" (Step ${idx + 1}).`);
      if (!ans.why.trim()) errors.push(`"Why" field required for "${comp.shortName}" (Step ${idx + 1}).`);
    });
    // urgent fields are optional — no validation needed
    return errors;
  };

  // ── Navigation ────────────────────────────────────────────────────────────────

  const goNext = () => {
    const errors = validateCurrentStep();
    if (errors.length > 0) { setValidationErrors(errors); return; }
    setValidationErrors([]);
    setStep(s => Math.min(s + 1, LAST_STEP));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goPrev = () => {
    setValidationErrors([]);
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Submission ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const errors = validateAll();
    if (errors.length > 0) { setValidationErrors(errors); return; }
    setValidationErrors([]);
    setSubmitting(true);
    setSubmitError(null);

    const levelStr = (id: string) => {
      const comp = COMPETENCIES.find(c => c.id === id)!;
      const ans = formData.competencies[id];
      const lvl = ans.level!;
      const desc = comp.levels.find(l => l.level === lvl)?.description ?? '';
      return `Level ${lvl} - ${desc}`;
    };

    const payload = [{
      'Email Address': formData.email,
      'Name ': formData.name,
      'Choose the campus you are referring to ': formData.campus,
      'Timestamp': new Date().toISOString(),
      'Meditation (Ana Pana for most and students attending Vipassana Camps) ': levelStr('meditation'),
      'Why have you marked Meditation level for this bracket?': formData.competencies.meditation.why,
      'Is there anything else you would like to share that is not covered in the above competency levels for Meditation bracket?': formData.competencies.meditation.additional,
      'Nutrition Supplementation + Yoga/Weight Training': levelStr('nutrition'),
      'Why have you marked this Nutrition Supplementation + Yoga/Weight Training for this bracket?': formData.competencies.nutrition.why,
      'Is there anything else you would like to share that is not covered in the above competency levels for Nutrition Supplementation + Yoga/Weight Training bracket?': formData.competencies.nutrition.additional,
      'Houses and Reward Systems': levelStr('houses'),
      'Why have you marked Houses and Reward Systems level for this bracket?': formData.competencies.houses.why,
      'Is there anything else you would like to share that is not covered in the above competency levels for Houses and Reward Systems bracket?': formData.competencies.houses.additional,
      'Etiocracy, Co-Creation & Ownership': levelStr('etiocracy'),
      'Why have you marked Etiocracy, Co-Creation & Ownership level for this bracket?': formData.competencies.etiocracy.why,
      'Is there anything else you would like to share that is not covered in the Etiocracy, Co-Creation & Ownership competency levels for this bracket?': formData.competencies.etiocracy.additional,
      'Campus interactions': levelStr('campusInteractions'),
      'Why have you marked this level for Campus interactions bracket?': formData.competencies.campusInteractions.why,
      'Is there anything else you would like to share that is not covered in the Campus interactions competency levels for this bracket?': formData.competencies.campusInteractions.additional,
      'Gratitude': levelStr('gratitude'),
      'Why have you marked Gratitude level for this bracket?': formData.competencies.gratitude.why,
      'Is there anything else you would like to share that is not covered in the Gratitude competency levels for this bracket?': formData.competencies.gratitude.additional,
      'Hackathons': levelStr('hackathons'),
      'Why have you marked Hackathons level for this bracket?': formData.competencies.hackathons.why,
      'Is there anything else you would like to share that is not covered in the Hackathons competency levels for this bracket?': formData.competencies.hackathons.additional,
      'English Communication & Comprehension': levelStr('english'),
      'Why have you marked English Communication & Comprehension level for this bracket?': formData.competencies.english.why,
      'Is there anything else you would like to share that is not covered in the English Communication & Comprehension competency levels for this bracket?': formData.competencies.english.additional,
      'Learning Environment & Peer Support': levelStr('learningEnvironment'),
      'Why have you marked Learning Environment & Peer Support level for this bracket?': formData.competencies.learningEnvironment.why,
      'Is there anything else you would like to share that is not covered in the Learning Environment & Peer Support competency levels for this bracket?': formData.competencies.learningEnvironment.additional,
      'Process Principles Understanding & Implementation': levelStr('processPrinciples'),
      'Why have you marked Process Principles Understanding & Implementation level for this bracket?': formData.competencies.processPrinciples.why,
      'Is there anything else you would like to share that is not covered in the Process Principles Understanding & Implementation competency levels for this bracket?': formData.competencies.processPrinciples.additional,
      'Life Skills Implementation \n\n(is english class + other other spaces on campus follow the framework of Activity Design and faciliation?\n\n1) Placements+AI (80%)\n2) Inner work, (10%)\n3) Ecology, Gender (10%) ': levelStr('lifeSkills'),
      'Why have you marked Life Skills Implementation  level for this bracket?': formData.competencies.lifeSkills.why,
      'Is there anything else you would like to share that is not covered in the Life Skills Implementation  competency levels for this bracket?': formData.competencies.lifeSkills.additional,
      'Is there anything that you find pressing in the campus, that needs urgent attention?': formData.urgentAttention,
      'Is there anything that you find in the campus, that directly needs escalation? This answer would be mailed to senior most team for urgent attention.': formData.escalation,
    }];

    try {
      const res = await fetch('https://backend.navgurukul.org/api/campus-pulse/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server responded with ${res.status}: ${text}`);
      }
      // Clear draft on success
      localStorage.removeItem(DRAFT_KEY);
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Submitted!</h2>
        <p className="text-gray-600 mb-2">Thank you, <span className="font-semibold">{formData.name}</span>.</p>
        <p className="text-gray-500 text-sm mb-8">
          Your evaluation for <span className="font-medium">{formData.campus}</span> has been recorded successfully.
        </p>
        <button
          onClick={() => { setSubmitted(false); setStep(0); setFormData(buildInitialFormData()); }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Submit Another Response
        </button>
      </div>
    );
  }

  // ── Derive current content ────────────────────────────────────────────────────

  const isBasicStep = step === 0;
  const isUrgentStep = step === LAST_STEP;
  const isCompetencyStep = step >= 1 && step <= 11;
  const currentComp = isCompetencyStep ? COMPETENCIES[step - 1] : null;
  const currentAns = currentComp ? formData.competencies[currentComp.id] : null;

  // Step label: basic info = "STEP 0 OF 12", competencies = "STEP 1 OF 11", urgent = "STEP 12 OF 12"
  const stepLabel = isBasicStep
    ? 'BASIC INFO'
    : isUrgentStep
    ? `STEP 11 OF 11 — URGENT ISSUES`
    : `STEP ${step} OF 11`;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-[600px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ── Left Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Competencies</h2>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {/* Basic Info */}
          <button
            onClick={() => { setValidationErrors([]); setStep(0); }}
            className={`w-full text-left px-4 py-3 text-sm transition-colors ${
              step === 0
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="block text-xs font-bold mb-0.5 opacity-70">INTRO</span>
            Basic Information
          </button>

          {/* Competency steps */}
          {COMPETENCIES.map((comp, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const ans = formData.competencies[comp.id];
            const isDone = ans.level !== null && ans.why.trim().length > 0;
            return (
              <button
                key={comp.id}
                onClick={() => { setValidationErrors([]); setStep(stepNum); }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors border-l-4 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold border-blue-700'
                    : isDone
                    ? 'text-gray-700 hover:bg-gray-100 border-green-400'
                    : 'text-gray-600 hover:bg-gray-100 border-transparent'
                }`}
              >
                <span className={`block text-xs font-bold mb-0.5 ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                  STEP {stepNum}
                </span>
                {comp.shortName}
                {isDone && !isActive && (
                  <span className="ml-1 text-green-500 text-xs">✓</span>
                )}
              </button>
            );
          })}

          {/* Urgent Issues */}
          <button
            onClick={() => { setValidationErrors([]); setStep(LAST_STEP); }}
            className={`w-full text-left px-4 py-3 text-sm transition-colors ${
              step === LAST_STEP
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="block text-xs font-bold mb-0.5 opacity-70">FINAL</span>
            Urgent Issues
          </button>
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div>
            <h1 className="text-base font-bold text-gray-900">Campus Competency — Revolver Observation</h1>
            {formData.campus && (
              <p className="text-xs text-gray-500 mt-0.5">{formData.campus}</p>
            )}
          </div>
          <span className="text-xs font-bold text-gray-500 tracking-widest whitespace-nowrap ml-4">
            {stepLabel}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-blue-600 transition-all duration-300"
            style={{ width: `${(step / LAST_STEP) * 100}%` }}
          />
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">Please fix the following:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {validationErrors.map((e, i) => (
                    <li key={i} className="text-sm text-red-600">{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {/* ── STEP 0: Basic Info ── */}
          {isBasicStep && (
            <div className="max-w-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Basic Information</h2>
              <p className="text-sm text-gray-500 mb-6">Please fill in your details before starting the evaluation.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => updateBasicField('email', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => updateBasicField('name', e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Campus <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.campus}
                    onChange={e => updateBasicField('campus', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select a campus…</option>
                    {CAMPUSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEPS 1-11: Competency ── */}
          {isCompetencyStep && currentComp && currentAns && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{currentComp.name}</h2>

              {/* Evaluator Guidance box */}
              <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6 mt-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Evaluator Guidance</p>
                  <p className="text-sm text-blue-700 leading-relaxed">{currentComp.guidance}</p>
                </div>
              </div>

              {/* Level selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Level <span className="text-red-500">*</span>
                </label>
                <LevelSelector
                  selected={currentAns.level}
                  onChange={val => updateCompetency(currentComp.id, 'level', val)}
                  levels={currentComp.levels}
                />
              </div>

              {/* Why textarea */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Why have you marked this level? <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Provide specific evidence and observations that support your level selection.
                </p>
                <textarea
                  value={currentAns.why}
                  onChange={e => updateCompetency(currentComp.id, 'why', e.target.value)}
                  rows={4}
                  placeholder="Describe the evidence and observations that led you to select this level…"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>

              {/* Additional observations textarea */}
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Future Improvements / Additional Observations
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Is there anything else you would like to share that is not covered in the competency levels above?
                </p>
                <textarea
                  value={currentAns.additional}
                  onChange={e => updateCompetency(currentComp.id, 'additional', e.target.value)}
                  rows={3}
                  placeholder="Any additional context, future improvement ideas, or observations…"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>
            </div>
          )}

          {/* ── STEP 12: Urgent Issues ── */}
          {isUrgentStep && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Urgent Issues</h2>
              <p className="text-sm text-gray-500 mb-6">Please share any pressing concerns or items that need escalation.</p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Is there anything that you find pressing in the campus, that needs urgent attention?
                  <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  value={formData.urgentAttention}
                  onChange={e => { setFormData(prev => ({ ...prev, urgentAttention: e.target.value })); setValidationErrors([]); }}
                  rows={5}
                  placeholder="Describe any urgent issues that need immediate attention…"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Is there anything that you find in the campus, that directly needs escalation?
                  <span className="text-gray-400 text-xs font-normal ml-1">(optional)</span>
                </label>
                <div className="flex gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700">
                    This answer will be mailed to the senior-most team for urgent attention.
                  </p>
                </div>
                <textarea
                  value={formData.escalation}
                  onChange={e => { setFormData(prev => ({ ...prev, escalation: e.target.value })); setValidationErrors([]); }}
                  rows={5}
                  placeholder="Describe any issues that need to be escalated to senior leadership…"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>
            </div>
          )}

        </div>

        {/* ── Bottom Navigation ── */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Section
          </button>

          <div className="flex items-center gap-2">
            {/* Draft saved indicator */}
            {draftSaved && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Draft saved
              </span>
            )}

            <button
              type="button"
              onClick={saveDraft}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>

            {step < LAST_STEP ? (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Section
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
