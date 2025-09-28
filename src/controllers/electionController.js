//one route call for all operation
import { uploadImage, uploadOptions, deleteImage } from '../config/cloudinary.js';
//import db from '../config/database.js';
import { pgPool as db } from '../config/database.js';
//import { uploadImage, uploadOptions, deleteImage } from '../services/cloudinaryService.js';

// Create Election
export const createElection = async (req, res) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      title,
      description,
      topicVideoUrl,
      customVotingUrl,
      startDate,
      endDate,
      startTime,
      endTime,
      timezone,
      votingType,
      permissionToVote,
      questions,
      authMethod,
      biometricRequired,
      allowOauth,
      allowMagicLink,
      allowEmailPassword,
      isCountrySpecific,
      countries,
      pricingType,
      isPaid,
      participationFee,
      regionalFees,
      processingFeePercentage,
      projectedRevenue,
      revenueSharePercentage,
      isLotterized,
      rewardType,
      rewardAmount,
      nonMonetaryReward,
      winnerCount,
      showLiveResults,
      allowVoteEditing,
      customCss,
      brandColors,
      primaryLanguage,
      supportsMultilang,
      isDraft,
      isPublished,
      creatorId
    } = req.body;
    console.log('📍 Debug values received:');
console.log('📍 startDate:', startDate, 'type:', typeof startDate);
console.log('📍 endDate:', endDate, 'type:', typeof endDate);
console.log('📍 startTime:', startTime, 'type:', typeof startTime);
console.log('📍 endTime:', endTime, 'type:', typeof endTime);
console.log('📍 Full req.body.startDate:', req.body.startDate);
console.log('📍 Full req.body.endDate:', req.body.endDate);
//console.log("📌 Full req.body content:", JSON.stringify(req.body, null, 2));
console.log("req.body====>", req.body)


    // Parse JSON strings if they exist
    const parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
    const parsedCountries = typeof countries === 'string' ? JSON.parse(countries) : countries;
    const parsedRegionalFees = typeof regionalFees === 'string' ? JSON.parse(regionalFees) : regionalFees;
    const parsedBrandColors = typeof brandColors === 'string' ? JSON.parse(brandColors) : brandColors;

    console.log('🚀 Starting election creation process...');

    // Step 1: Insert main election data and get election ID
    const electionQuery = `
      INSERT INTO vottery_elections (
        title, description, topic_video_url, custom_voting_url,
        start_date, end_date, start_time, end_time, timezone,
        voting_type, permission_to_vote, auth_method, biometric_required,
        allow_oauth, allow_magic_link, allow_email_password,
        is_country_specific, countries, pricing_type, is_paid,
        participation_fee, regional_fees, processing_fee_percentage,
        projected_revenue, revenue_share_percentage, show_live_results,
        allow_vote_editing, custom_css, brand_colors, primary_language,
        supports_multilang, is_draft, is_published, creator_id,
        last_saved
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, CURRENT_TIMESTAMP
      ) RETURNING id
    `;

    //after correction
    const electionValues = [
  title, description, topicVideoUrl, customVotingUrl,
  startDate?.date || startDate || null,
  endDate?.date || endDate || null,
  startTime || '09:00', endTime || '18:00', timezone || 'UTC',
  votingType || 'plurality', permissionToVote || 'open',
  authMethod || 'passkey', biometricRequired || false,
  allowOauth !== false, allowMagicLink !== false, allowEmailPassword !== false,
  isCountrySpecific || false, JSON.stringify(parsedCountries || []),
  pricingType || 'free', isPaid || false,
  participationFee || 0, JSON.stringify(parsedRegionalFees || {}),
  processingFeePercentage || 0, projectedRevenue || 0,
  revenueSharePercentage || 0, showLiveResults !== false,
  allowVoteEditing !== false, customCss || '',
  JSON.stringify(parsedBrandColors || {}), primaryLanguage || 'en',
  supportsMultilang || false, isDraft !== false,
  isPublished || false, creatorId || 1
];

    const electionResult = await client.query(electionQuery, electionValues);
    const electionId = electionResult.rows[0].id;

    console.log(`✅ Election created with ID: ${electionId}`);

    // Step 2: Handle image uploads and update URLs
    let topicImageUrl = null;
    let logoBrandingUrl = null;

    // Upload topic image
    if (req.files?.topicImage?.[0]) {
      try {
        console.log('📸 Uploading topic image...');
        const topicImageResult = await uploadImage(
          req.files.topicImage[0].buffer,
          {
            ...uploadOptions.elections,
            public_id: `vottery/elections/${electionId}/topic_${Date.now()}`
          }
        );
        topicImageUrl = topicImageResult.secure_url;

        // Save image record
        await client.query(`
          INSERT INTO vottery_election_images 
          (election_id, image_type, cloudinary_public_id, cloudinary_url, original_filename)
          VALUES ($1, $2, $3, $4, $5)
        `, [electionId, 'topic', topicImageResult.public_id, topicImageUrl, req.files.topicImage[0].originalname]);

        console.log('✅ Topic image uploaded successfully');
      } catch (error) {
        console.error('❌ Topic image upload failed:', error);
      }
    }

    // Upload logo branding image
    if (req.files?.logoBranding?.[0]) {
      try {
        console.log('🎨 Uploading logo branding image...');
        const logoResult = await uploadImage(
          req.files.logoBranding[0].buffer,
          {
            ...uploadOptions.logos,
            public_id: `vottery/elections/${electionId}/logo_${Date.now()}`
          }
        );
        logoBrandingUrl = logoResult.secure_url;

        // Save image record
        await client.query(`
          INSERT INTO vottery_election_images 
          (election_id, image_type, cloudinary_public_id, cloudinary_url, original_filename)
          VALUES ($1, $2, $3, $4, $5)
        `, [electionId, 'logo', logoResult.public_id, logoBrandingUrl, req.files.logoBranding[0].originalname]);

        console.log('✅ Logo branding image uploaded successfully');
      } catch (error) {
        console.error('❌ Logo branding upload failed:', error);
      }
    }

    // Update election with image URLs
    if (topicImageUrl || logoBrandingUrl) {
      await client.query(`
        UPDATE vottery_elections 
        SET topic_image_url = COALESCE($1, topic_image_url),
            logo_branding_url = COALESCE($2, logo_branding_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [topicImageUrl, logoBrandingUrl, electionId]);
    }

    // Step 3: Insert questions and their answers
    if (parsedQuestions && parsedQuestions.length > 0) {
      console.log(`📝 Creating ${parsedQuestions.length} questions...`);

      for (let i = 0; i < parsedQuestions.length; i++) {
        const question = parsedQuestions[i];
        
        // Insert question
        const questionQuery = `
          INSERT INTO vottery_election_questions (
            election_id, question_text, question_type, is_required,
            allow_other_option, character_limit, question_order, question_external_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
        `;

        const questionValues = [
          electionId,
          question.questionText,
          question.questionType || 'multiple_choice',
          question.isRequired !== false,
          question.allowOtherOption || false,
          question.characterLimit || 5000,
          i + 1,
          question.id
        ];

        const questionResult = await client.query(questionQuery, questionValues);
        const questionId = questionResult.rows[0].id;

        // Handle question image upload
        if (req.files?.questionImages) {
          const questionImageFile = req.files.questionImages.find(file => 
            file.fieldname === `questionImages` && file.originalname.includes(question.id)
          );

          if (questionImageFile) {
            try {
              console.log(`📷 Uploading image for question ${i + 1}...`);
              const questionImageResult = await uploadImage(
                questionImageFile.buffer,
                {
                  ...uploadOptions.questions,
                  public_id: `vottery/elections/${electionId}/questions/q${questionId}_${Date.now()}`
                }
              );

              // Update question with image URL
              await client.query(`
                UPDATE vottery_election_questions 
                SET question_image_url = $1 
                WHERE id = $2
              `, [questionImageResult.secure_url, questionId]);

              // Save image record
              await client.query(`
                INSERT INTO vottery_election_images 
                (election_id, image_type, cloudinary_public_id, cloudinary_url, original_filename, reference_id)
                VALUES ($1, $2, $3, $4, $5, $6)
              `, [electionId, 'question', questionImageResult.public_id, questionImageResult.secure_url, questionImageFile.originalname, questionId]);

              console.log(`✅ Question ${i + 1} image uploaded successfully`);
            } catch (error) {
              console.error(`❌ Question ${i + 1} image upload failed:`, error);
            }
          }
        }

        // Insert answers for this question
        if (question.answers && question.answers.length > 0) {
          console.log(`📋 Creating ${question.answers.length} answers for question ${i + 1}...`);

          for (let j = 0; j < question.answers.length; j++) {
            const answer = question.answers[j];

            const answerQuery = `
              INSERT INTO vottery_question_answers (
                question_id, answer_text, answer_order, answer_external_id
              ) VALUES ($1, $2, $3, $4) RETURNING id
            `;

            const answerValues = [
              questionId,
              answer.text,
              j + 1,
              answer.id
            ];

            const answerResult = await client.query(answerQuery, answerValues);
            const answerId = answerResult.rows[0].id;

            // Handle answer image upload
            if (req.files?.answerImages) {
              const answerImageFile = req.files.answerImages.find(file => 
                file.fieldname === `answerImages` && file.originalname.includes(answer.id)
              );

              if (answerImageFile) {
                try {
                  console.log(`🖼️ Uploading image for answer ${j + 1} of question ${i + 1}...`);
                  const answerImageResult = await uploadImage(
                    answerImageFile.buffer,
                    {
                      ...uploadOptions.answers,
                      public_id: `vottery/elections/${electionId}/answers/a${answerId}_${Date.now()}`
                    }
                  );

                  // Update answer with image URL
                  await client.query(`
                    UPDATE vottery_question_answers 
                    SET answer_image_url = $1 
                    WHERE id = $2
                  `, [answerImageResult.secure_url, answerId]);

                  // Save image record
                  await client.query(`
                    INSERT INTO vottery_election_images 
                    (election_id, image_type, cloudinary_public_id, cloudinary_url, original_filename, reference_id)
                    VALUES ($1, $2, $3, $4, $5, $6)
                  `, [electionId, 'answer', answerImageResult.public_id, answerImageResult.secure_url, answerImageFile.originalname, answerId]);

                  console.log(`✅ Answer ${j + 1} image uploaded successfully`);
                } catch (error) {
                  console.error(`❌ Answer ${j + 1} image upload failed:`, error);
                }
              }
            }
          }
        }
      }
    }

    // Step 4: Insert lottery configuration if enabled (with error handling)
    if (isLotterized) {
      console.log('🎰 Setting up lottery configuration...');
      
      try {
        const lotteryQuery = `
          INSERT INTO vottery_election_lottery (
            election_id, is_lotterized, reward_type, reward_amount,
            non_monetary_reward, winner_count, lottery_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        // Fix the reward type and non-monetary reward logic
        let finalRewardType = rewardType || 'monetary';
        let finalNonMonetaryReward = nonMonetaryReward;
        
        // If reward type is non_monetary but no reward description provided, set a default
        if (finalRewardType === 'non_monetary' && (!finalNonMonetaryReward || finalNonMonetaryReward.trim() === '')) {
          finalNonMonetaryReward = 'To be determined';
        }
        
        // If reward type is monetary, clear non-monetary reward
        if (finalRewardType === 'monetary') {
          finalNonMonetaryReward = null;
        }

        const lotteryValues = [
          electionId,
          true,
          finalRewardType,
          rewardAmount || 0,
          finalNonMonetaryReward,
          winnerCount || 1,
          true
        ];

        await client.query(lotteryQuery, lotteryValues);
        console.log('✅ Lottery configuration saved successfully');
      } catch (lotteryError) {
        console.error('⚠️ Lottery configuration failed (continuing without lottery):', lotteryError.message);
        // Don't throw the error - let election creation continue
      }
    }

    await client.query('COMMIT');

    // Fetch the complete election data to return
    const completeElection = await getCompleteElectionData(electionId, client);

    console.log(`🎉 Election creation completed successfully! Election ID: ${electionId}`);

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      data: completeElection
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Election creation failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create election',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// Get Election by ID
export const getElection = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await db.connect();
    
    const election = await getCompleteElectionData(id, client);
    
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    res.json({
      success: true,
      data: election
    });

    client.release();
  } catch (error) {
    console.error('❌ Get election failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch election',
      error: error.message
    });
  }
};

// Get All Elections
export const getAllElections = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, creatorId } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND is_published = $${paramCount}`;
      queryParams.push(status === 'published');
    }

    if (creatorId) {
      paramCount++;
      whereClause += ` AND creator_id = $${paramCount}`;
      queryParams.push(creatorId);
    }

    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;

    const electionsQuery = `
      SELECT 
        e.*,
        COUNT(eq.id) as question_count,
        el.is_lotterized,
        el.reward_amount,
        el.winner_count
      FROM vottery_elections e
      LEFT JOIN vottery_election_questions eq ON e.id = eq.election_id
      LEFT JOIN vottery_election_lottery el ON e.id = el.election_id
      ${whereClause}
      GROUP BY e.id, el.is_lotterized, el.reward_amount, el.winner_count
      ORDER BY e.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    queryParams.push(limit, offset);

    const client = await db.connect();
    const result = await client.query(electionsQuery, queryParams);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM vottery_elections e ${whereClause}`;
    const countResult = await client.query(countQuery, queryParams.slice(0, -2));
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        elections: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      }
    });

    client.release();
  } catch (error) {
    console.error('❌ Get all elections failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch elections',
      error: error.message
    });
  }
};

// Update Election
export const updateElection = async (req, res) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const updateData = req.body;

    // Check if election exists
    const existingElection = await client.query('SELECT * FROM vottery_elections WHERE id = $1', [id]);
    if (existingElection.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'questions') {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length > 0) {
      paramCount++;
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateFields.push(`last_saved = CURRENT_TIMESTAMP`);
      
      const updateQuery = `
        UPDATE vottery_elections 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
      `;
      updateValues.push(id);

      await client.query(updateQuery, updateValues);
    }

    await client.query('COMMIT');

    // Fetch updated election
    const updatedElection = await getCompleteElectionData(id, client);

    res.json({
      success: true,
      message: 'Election updated successfully',
      data: updatedElection
    });

    client.release();
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Update election failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update election',
      error: error.message
    });
  }
};

// Delete Election
export const deleteElection = async (req, res) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;

    // Get all images associated with this election
    const imagesResult = await client.query(
      'SELECT cloudinary_public_id FROM vottery_election_images WHERE election_id = $1',
      [id]
    );

    // Delete from Cloudinary
    for (const image of imagesResult.rows) {
      try {
        await deleteImage(image.cloudinary_public_id);
      } catch (error) {
        console.error(`Failed to delete image ${image.cloudinary_public_id}:`, error);
      }
    }

    // Delete election (cascade will handle related records)
    const deleteResult = await client.query('DELETE FROM vottery_elections WHERE id = $1', [id]);
    
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Election deleted successfully'
    });

    client.release();
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Delete election failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete election',
      error: error.message
    });
  }
};

// Helper function to get complete election data
async function getCompleteElectionData(electionId, client) {
  try {
    // Get main election data
    const electionResult = await client.query(`
      SELECT e.*, el.is_lotterized, el.reward_type, el.reward_amount, 
             el.non_monetary_reward, el.winner_count, el.lottery_active
      FROM vottery_elections e
      LEFT JOIN vottery_election_lottery el ON e.id = el.election_id
      WHERE e.id = $1
    `, [electionId]);

    if (electionResult.rows.length === 0) {
      return null;
    }

    const election = electionResult.rows[0];

    // Get questions with answers
    const questionsResult = await client.query(`
      SELECT eq.*, qa.id as answer_id, qa.answer_text, qa.answer_image_url, 
             qa.answer_order, qa.answer_external_id
      FROM vottery_election_questions eq
      LEFT JOIN vottery_question_answers qa ON eq.id = qa.question_id
      WHERE eq.election_id = $1
      ORDER BY eq.question_order, qa.answer_order
    `, [electionId]);

    // Group questions with their answers
    const questionsMap = new Map();
    
    questionsResult.rows.forEach(row => {
      if (!questionsMap.has(row.id)) {
        questionsMap.set(row.id, {
          id: row.question_external_id || row.id,
          questionText: row.question_text,
          questionType: row.question_type,
          questionImageUrl: row.question_image_url,
          isRequired: row.is_required,
          allowOtherOption: row.allow_other_option,
          characterLimit: row.character_limit,
          answers: []
        });
      }

      if (row.answer_id) {
        questionsMap.get(row.id).answers.push({
          id: row.answer_external_id || row.answer_id,
          text: row.answer_text,
          imageUrl: row.answer_image_url
        });
      }
    });

    const questions = Array.from(questionsMap.values());

    const parsedElection = {
      ...election,
      countries: typeof election.countries === 'string' ? JSON.parse(election.countries) : (election.countries || []),
      regionalFees: typeof election.regional_fees === 'string' ? JSON.parse(election.regional_fees) : (election.regional_fees || {}),
      brandColors: typeof election.brand_colors === 'string' ? JSON.parse(election.brand_colors) : (election.brand_colors || {}),
      questions: questions,
      topicVideoUrl: election.topic_video_url,
      startDate: {
        date: election.start_date,
        time: election.start_time
      },
      endDate: {
        date: election.end_date,
        time: election.end_time
      }
    };

    return parsedElection;
  } catch (error) {
    console.error('Error fetching complete election data:', error);
    throw error;
  }
}
// //one route call for all operation
// import { uploadImage, uploadOptions, deleteImage } from '../config/cloudinary.js';
// //import db from '../config/database.js';
// import { pgPool as db } from '../config/database.js';
// //import { uploadImage, uploadOptions, deleteImage } from '../services/cloudinaryService.js';

// // Create Election
// export const createElection = async (req, res) => {
//   const client = await db.connect();
  
//   try {
//     await client.query('BEGIN');
    
//     const {
//       title,
//       description,
//       topicVideoUrl,
//       customVotingUrl,
//       startDate,
//       endDate,
//       startTime,
//       endTime,
//       timezone,
//       votingType,
//       permissionToVote,
//       questions,
//       authMethod,
//       biometricRequired,
//       allowOauth,
//       allowMagicLink,
//       allowEmailPassword,
//       isCountrySpecific,
//       countries,
//       pricingType,
//       isPaid,
//       participationFee,
//       regionalFees,
//       processingFeePercentage,
//       projectedRevenue,
//       revenueSharePercentage,
//       isLotterized,
//       rewardType,
//       rewardAmount,
//       nonMonetaryReward,
//       winnerCount,
//       showLiveResults,
//       allowVoteEditing,
//       customCss,
//       brandColors,
//       primaryLanguage,
//       supportsMultilang,
//       isDraft,
//       isPublished,
//       creatorId
//     } = req.body;
//     console.log('📍 Debug values received:');
// console.log('📍 startDate:', startDate, 'type:', typeof startDate);
// console.log('📍 endDate:', endDate, 'type:', typeof endDate);
// console.log('📍 startTime:', startTime, 'type:', typeof startTime);
// console.log('📍 endTime:', endTime, 'type:', typeof endTime);
// console.log('📍 Full req.body.startDate:', req.body.startDate);
// console.log('📍 Full req.body.endDate:', req.body.endDate);
// //console.log("📌 Full req.body content:", JSON.stringify(req.body, null, 2));
// console.log("req.body====>", req.body)


//     // Parse JSON strings if they exist
//     const parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
//     const parsedCountries = typeof countries === 'string' ? JSON.parse(countries) : countries;
//     const parsedRegionalFees = typeof regionalFees === 'string' ? JSON.parse(regionalFees) : regionalFees;
//     const parsedBrandColors = typeof brandColors === 'string' ? JSON.parse(brandColors) : brandColors;

//     console.log('🚀 Starting election creation process...');

//     // Step 1: Insert main election data and get election ID
//     const electionQuery = `
//       INSERT INTO vottery_elections (
//         title, description, topic_video_url, custom_voting_url,
//         start_date, end_date, start_time, end_time, timezone,
//         voting_type, permission_to_vote, auth_method, biometric_required,
//         allow_oauth, allow_magic_link, allow_email_password,
//         is_country_specific, countries, pricing_type, is_paid,
//         participation_fee, regional_fees, processing_fee_percentage,
//         projected_revenue, revenue_share_percentage, show_live_results,
//         allow_vote_editing, custom_css, brand_colors, primary_language,
//         supports_multilang, is_draft, is_published, creator_id,
//         last_saved
//       ) VALUES (
//         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
//         $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
//         $31, $32, $33, $34, CURRENT_TIMESTAMP
//       ) RETURNING id
//     `;

//     //after correction
//     const electionValues = [
//   title, description, topicVideoUrl, customVotingUrl,
//   startDate?.date || startDate || null,
//   endDate?.date || endDate || null,
//   startTime || '09:00', endTime || '18:00', timezone || 'UTC',
//   votingType || 'plurality', permissionToVote || 'open',
//   authMethod || 'passkey', biometricRequired || false,
//   allowOauth !== false, allowMagicLink !== false, allowEmailPassword !== false,
//   isCountrySpecific || false, JSON.stringify(parsedCountries || []),
//   pricingType || 'free', isPaid || false,
//   participationFee || 0, JSON.stringify(parsedRegionalFees || {}),
//   processingFeePercentage || 0, projectedRevenue || 0,
//   revenueSharePercentage || 0, showLiveResults !== false,
//   allowVoteEditing !== false, customCss || '',
//   JSON.stringify(parsedBrandColors || {}), primaryLanguage || 'en',
//   supportsMultilang || false, isDraft !== false,
//   isPublished || false, creatorId || 1
// ];


//     // const electionValues = [
//     //   title, description, topicVideoUrl, customVotingUrl,
//     //   //startDate?.date || null, endDate?.date || null, 
//     //   startDate || null, endDate || null,
//     //   startTime || '09:00', endTime || '18:00', timezone || 'UTC',
//     //   votingType || 'plurality', permissionToVote || 'open',
//     //   authMethod || 'passkey', biometricRequired || false,
//     //   allowOauth !== false, allowMagicLink !== false, allowEmailPassword !== false,
//     //   isCountrySpecific || false, JSON.stringify(parsedCountries || []),
//     //   pricingType || 'free', isPaid || false,
//     //   participationFee || 0, JSON.stringify(parsedRegionalFees || {}),
//     //   processingFeePercentage || 0, projectedRevenue || 0,
//     //   revenueSharePercentage || 0, showLiveResults !== false,
//     //   allowVoteEditing !== false, customCss || '',
//     //   JSON.stringify(parsedBrandColors || {}), primaryLanguage || 'en',
//     //   supportsMultilang || false, isDraft !== false,
//     //   isPublished || false, creatorId || 1
//     // ];

//     const electionResult = await client.query(electionQuery, electionValues);
//     const electionId = electionResult.rows[0].id;

//     console.log(`✅ Election created with ID: ${electionId}`);

//     // Step 2: Handle image uploads and update URLs
//     let topicImageUrl = null;
//     let logoBrandingUrl = null;

//     // Upload topic image
//     if (req.files?.topicImage?.[0]) {
//       try {
//         console.log('📸 Uploading topic image...');
//         const topicImageResult = await uploadImage(
//           req.files.topicImage[0].buffer,
//           {
//             ...uploadOptions.elections,
//             public_id: `vottery/elections/${electionId}/topic_${Date.now()}`
//           }
//         );
//         topicImageUrl = topicImageResult.secure_url;

//         // Save image record
//         await client.query(`
//           INSERT INTO vottery_election_images 
//           (election_id, image_type, cloudinary_public_id, cloudinary_url, original_filename)
//           VALUES ($1, $2, $3, $4, $5)
//         `, [electionId, 'topic', topicImageResult.public_id, topicImageUrl, req.files.topicImage[0].originalname]);

//         console.log('✅ Topic image uploaded successfully');
//       } catch (error) {
//         console.error('❌ Topic image upload failed:', error);
//       }
//     }

//     // Upload logo branding image
//     if (req.files?.logoBranding?.[0]) {
//       try {
//         console.log('🎨 Uploading logo branding image...');
//         const logoResult = await uploadImage(
//           req.files.logoBranding[0].buffer,
//           {
//             ...uploadOptions.logos,
//             public_id: `vottery/elections/${electionId}/logo_${Date.now()}`
//           }
//         );
//         logoBrandingUrl = logoResult.secure_url;

//         // Save image record
//         await client.query(`
//           INSERT INTO vottery_election_images 
//           (election_id, image_type, cloudinary_public_id, cloudinary_url, original_filename)
//           VALUES ($1, $2, $3, $4, $5)
//         `, [electionId, 'logo', logoResult.public_id, logoBrandingUrl, req.files.logoBranding[0].originalname]);

//         console.log('✅ Logo branding image uploaded successfully');
//       } catch (error) {
//         console.error('❌ Logo branding upload failed:', error);
//       }
//     }

//     // Update election with image URLs
//     if (topicImageUrl || logoBrandingUrl) {
//       await client.query(`
//         UPDATE vottery_elections 
//         SET topic_image_url = COALESCE($1, topic_image_url),
//             logo_branding_url = COALESCE($2, logo_branding_url),
//             updated_at = CURRENT_TIMESTAMP
//         WHERE id = $3
//       `, [topicImageUrl, logoBrandingUrl, electionId]);
//     }

//     // Step 3: Insert questions and their answers
//     if (parsedQuestions && parsedQuestions.length > 0) {
//       console.log(`📝 Creating ${parsedQuestions.length} questions...`);

//       for (let i = 0; i < parsedQuestions.length; i++) {
//         const question = parsedQuestions[i];
        
//         // Insert question
//         const questionQuery = `
//           INSERT INTO vottery_election_questions (
//             election_id, question_text, question_type, is_required,
//             allow_other_option, character_limit, question_order, question_external_id
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
//         `;

//         const questionValues = [
//           electionId,
//           question.questionText,
//           question.questionType || 'multiple_choice',
//           question.isRequired !== false,
//           question.allowOtherOption || false,
//           question.characterLimit || 5000,
//           i + 1,
//           question.id
//         ];

//         const questionResult = await client.query(questionQuery, questionValues);
//         const questionId = questionResult.rows[0].id;

//         // Handle question image upload
//         if (req.files?.questionImages) {
//           const questionImageFile = req.files.questionImages.find(file => 
//             file.fieldname === `questionImages` && file.originalname.includes(question.id)
//           );

//           if (questionImageFile) {
//             try {
//               console.log(`📷 Uploading image for question ${i + 1}...`);
//               const questionImageResult = await uploadImage(
//                 questionImageFile.buffer,
//                 {
//                   ...uploadOptions.questions,
//                   public_id: `vottery/elections/${electionId}/questions/q${questionId}_${Date.now()}`
//                 }
//               );

//               // Update question with image URL
//               await client.query(`
//                 UPDATE vottery_election_questions 
//                 SET question_image_url = $1 
//                 WHERE id = $2
//               `, [questionImageResult.secure_url, questionId]);

//               // Save image record
//               await client.query(`
//                 INSERT INTO vottery_election_images 
//                 (election_id, image_type, cloudinary_public_id, cloudinary_url, original_filename, reference_id)
//                 VALUES ($1, $2, $3, $4, $5, $6)
//               `, [electionId, 'question', questionImageResult.public_id, questionImageResult.secure_url, questionImageFile.originalname, questionId]);

//               console.log(`✅ Question ${i + 1} image uploaded successfully`);
//             } catch (error) {
//               console.error(`❌ Question ${i + 1} image upload failed:`, error);
//             }
//           }
//         }

//         // Insert answers for this question
//         if (question.answers && question.answers.length > 0) {
//           console.log(`📋 Creating ${question.answers.length} answers for question ${i + 1}...`);

//           for (let j = 0; j < question.answers.length; j++) {
//             const answer = question.answers[j];

//             const answerQuery = `
//               INSERT INTO vottery_question_answers (
//                 question_id, answer_text, answer_order, answer_external_id
//               ) VALUES ($1, $2, $3, $4) RETURNING id
//             `;

//             const answerValues = [
//               questionId,
//               answer.text,
//               j + 1,
//               answer.id
//             ];

//             const answerResult = await client.query(answerQuery, answerValues);
//             const answerId = answerResult.rows[0].id;

//             // Handle answer image upload
//             if (req.files?.answerImages) {
//               const answerImageFile = req.files.answerImages.find(file => 
//                 file.fieldname === `answerImages` && file.originalname.includes(answer.id)
//               );

//               if (answerImageFile) {
//                 try {
//                   console.log(`🖼️ Uploading image for answer ${j + 1} of question ${i + 1}...`);
//                   const answerImageResult = await uploadImage(
//                     answerImageFile.buffer,
//                     {
//                       ...uploadOptions.answers,
//                       public_id: `vottery/elections/${electionId}/answers/a${answerId}_${Date.now()}`
//                     }
//                   );

//                   // Update answer with image URL
//                   await client.query(`
//                     UPDATE vottery_question_answers 
//                     SET answer_image_url = $1 
//                     WHERE id = $2
//                   `, [answerImageResult.secure_url, answerId]);

//                   // Save image record
//                   await client.query(`
//                     INSERT INTO vottery_election_images 
//                     (election_id, image_type, cloudinary_public_id, cloudinary_url, original_filename, reference_id)
//                     VALUES ($1, $2, $3, $4, $5, $6)
//                   `, [electionId, 'answer', answerImageResult.public_id, answerImageResult.secure_url, answerImageFile.originalname, answerId]);

//                   console.log(`✅ Answer ${j + 1} image uploaded successfully`);
//                 } catch (error) {
//                   console.error(`❌ Answer ${j + 1} image upload failed:`, error);
//                 }
//               }
//             }
//           }
//         }
//       }
//     }

//     // Step 4: Insert lottery configuration if enabled
//     if (isLotterized) {
//       console.log('🎰 Setting up lottery configuration...');
      
//       const lotteryQuery = `
//         INSERT INTO vottery_election_lottery (
//           election_id, is_lotterized, reward_type, reward_amount,
//           non_monetary_reward, winner_count, lottery_active
//         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
//       `;

//       const lotteryValues = [
//         electionId,
//         true,
//         rewardType || 'monetary',
//         rewardAmount || 0,
//         nonMonetaryReward || '',
//         winnerCount || 1,
//         true
//       ];

//       await client.query(lotteryQuery, lotteryValues);
//       console.log('✅ Lottery configuration saved successfully');
//     }

//     await client.query('COMMIT');

//     // Fetch the complete election data to return
//     const completeElection = await getCompleteElectionData(electionId, client);

//     console.log(`🎉 Election creation completed successfully! Election ID: ${electionId}`);

//     res.status(201).json({
//       success: true,
//       message: 'Election created successfully',
//       data: completeElection
//     });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Election creation failed:', error);
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create election',
//       error: error.message
//     });
//   } finally {
//     client.release();
//   }
// };

// // Get Election by ID
// export const getElection = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const client = await db.connect();
    
//     const election = await getCompleteElectionData(id, client);
    
//     if (!election) {
//       return res.status(404).json({
//         success: false,
//         message: 'Election not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: election
//     });

//     client.release();
//   } catch (error) {
//     console.error('❌ Get election failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch election',
//       error: error.message
//     });
//   }
// };

// // Get All Elections
// export const getAllElections = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, status, creatorId } = req.query;
//     const offset = (page - 1) * limit;

//     let whereClause = 'WHERE 1=1';
//     const queryParams = [];
//     let paramCount = 0;

//     if (status) {
//       paramCount++;
//       whereClause += ` AND is_published = $${paramCount}`;
//       queryParams.push(status === 'published');
//     }

//     if (creatorId) {
//       paramCount++;
//       whereClause += ` AND creator_id = $${paramCount}`;
//       queryParams.push(creatorId);
//     }

//     paramCount++;
//     const limitParam = paramCount;
//     paramCount++;
//     const offsetParam = paramCount;

//     const electionsQuery = `
//       SELECT 
//         e.*,
//         COUNT(eq.id) as question_count,
//         el.is_lotterized,
//         el.reward_amount,
//         el.winner_count
//       FROM vottery_elections e
//       LEFT JOIN vottery_election_questions eq ON e.id = eq.election_id
//       LEFT JOIN vottery_election_lottery el ON e.id = el.election_id
//       ${whereClause}
//       GROUP BY e.id, el.is_lotterized, el.reward_amount, el.winner_count
//       ORDER BY e.created_at DESC
//       LIMIT $${limitParam} OFFSET $${offsetParam}
//     `;

//     queryParams.push(limit, offset);

//     const client = await db.connect();
//     const result = await client.query(electionsQuery, queryParams);

//     // Get total count
//     const countQuery = `SELECT COUNT(*) FROM vottery_elections e ${whereClause}`;
//     const countResult = await client.query(countQuery, queryParams.slice(0, -2));
//     const totalCount = parseInt(countResult.rows[0].count);

//     res.json({
//       success: true,
//       data: {
//         elections: result.rows,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(totalCount / limit),
//           totalCount,
//           hasNext: page * limit < totalCount,
//           hasPrev: page > 1
//         }
//       }
//     });

//     client.release();
//   } catch (error) {
//     console.error('❌ Get all elections failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch elections',
//       error: error.message
//     });
//   }
// };

// // Update Election
// export const updateElection = async (req, res) => {
//   const client = await db.connect();
  
//   try {
//     await client.query('BEGIN');
    
//     const { id } = req.params;
//     const updateData = req.body;

//     // Check if election exists
//     const existingElection = await client.query('SELECT * FROM vottery_elections WHERE id = $1', [id]);
//     if (existingElection.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Election not found'
//       });
//     }

//     // Build dynamic update query
//     const updateFields = [];
//     const updateValues = [];
//     let paramCount = 0;

//     Object.keys(updateData).forEach(key => {
//       if (updateData[key] !== undefined && key !== 'questions') {
//         paramCount++;
//         updateFields.push(`${key} = $${paramCount}`);
//         updateValues.push(updateData[key]);
//       }
//     });

//     if (updateFields.length > 0) {
//       paramCount++;
//       updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
//       updateFields.push(`last_saved = CURRENT_TIMESTAMP`);
      
//       const updateQuery = `
//         UPDATE vottery_elections 
//         SET ${updateFields.join(', ')}
//         WHERE id = $${paramCount}
//       `;
//       updateValues.push(id);

//       await client.query(updateQuery, updateValues);
//     }

//     await client.query('COMMIT');

//     // Fetch updated election
//     const updatedElection = await getCompleteElectionData(id, client);

//     res.json({
//       success: true,
//       message: 'Election updated successfully',
//       data: updatedElection
//     });

//     client.release();
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Update election failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update election',
//       error: error.message
//     });
//   }
// };

// // Delete Election
// export const deleteElection = async (req, res) => {
//   const client = await db.connect();
  
//   try {
//     await client.query('BEGIN');
    
//     const { id } = req.params;

//     // Get all images associated with this election
//     const imagesResult = await client.query(
//       'SELECT cloudinary_public_id FROM vottery_election_images WHERE election_id = $1',
//       [id]
//     );

//     // Delete from Cloudinary
//     for (const image of imagesResult.rows) {
//       try {
//         await deleteImage(image.cloudinary_public_id);
//       } catch (error) {
//         console.error(`Failed to delete image ${image.cloudinary_public_id}:`, error);
//       }
//     }

//     // Delete election (cascade will handle related records)
//     const deleteResult = await client.query('DELETE FROM vottery_elections WHERE id = $1', [id]);
    
//     if (deleteResult.rowCount === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Election not found'
//       });
//     }

//     await client.query('COMMIT');

//     res.json({
//       success: true,
//       message: 'Election deleted successfully'
//     });

//     client.release();
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Delete election failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete election',
//       error: error.message
//     });
//   }
// };

// // Helper function to get complete election data
// async function getCompleteElectionData(electionId, client) {
//   try {
//     // Get main election data
//     const electionResult = await client.query(`
//       SELECT e.*, el.is_lotterized, el.reward_type, el.reward_amount, 
//              el.non_monetary_reward, el.winner_count, el.lottery_active
//       FROM vottery_elections e
//       LEFT JOIN vottery_election_lottery el ON e.id = el.election_id
//       WHERE e.id = $1
//     `, [electionId]);

//     if (electionResult.rows.length === 0) {
//       return null;
//     }

//     const election = electionResult.rows[0];

//     // Get questions with answers
//     const questionsResult = await client.query(`
//       SELECT eq.*, qa.id as answer_id, qa.answer_text, qa.answer_image_url, 
//              qa.answer_order, qa.answer_external_id
//       FROM vottery_election_questions eq
//       LEFT JOIN vottery_question_answers qa ON eq.id = qa.question_id
//       WHERE eq.election_id = $1
//       ORDER BY eq.question_order, qa.answer_order
//     `, [electionId]);

//     // Group questions with their answers
//     const questionsMap = new Map();
    
//     questionsResult.rows.forEach(row => {
//       if (!questionsMap.has(row.id)) {
//         questionsMap.set(row.id, {
//           id: row.question_external_id || row.id,
//           questionText: row.question_text,
//           questionType: row.question_type,
//           questionImageUrl: row.question_image_url,
//           isRequired: row.is_required,
//           allowOtherOption: row.allow_other_option,
//           characterLimit: row.character_limit,
//           answers: []
//         });
//       }

//       if (row.answer_id) {
//         questionsMap.get(row.id).answers.push({
//           id: row.answer_external_id || row.answer_id,
//           text: row.answer_text,
//           imageUrl: row.answer_image_url
//         });
//       }
//     });

//     const questions = Array.from(questionsMap.values());

//     // Parse JSON fields with safety check
//     // const parsedElection = {
//     //   ...election,
//     //   countries: typeof election.countries === 'string' ? JSON.parse(election.countries) : (election.countries || []),
//     //   regionalFees: typeof election.regional_fees === 'string' ? JSON.parse(election.regional_fees) : (election.regional_fees || {}),
//     //   brandColors: typeof election.brand_colors === 'string' ? JSON.parse(election.brand_colors) : (election.brand_colors || {}),
//     //   questions: questions,
//     //   startDate: {
//     //     date: election.start_date,
//     //     time: election.start_time
//     //   },
//     //   endDate: {
//     //     date: election.end_date,
//     //     time: election.end_time
//     //   }
//     // };
//     const parsedElection = {
//   ...election,
//   countries: typeof election.countries === 'string' ? JSON.parse(election.countries) : (election.countries || []),
//   regionalFees: typeof election.regional_fees === 'string' ? JSON.parse(election.regional_fees) : (election.regional_fees || {}),
//   brandColors: typeof election.brand_colors === 'string' ? JSON.parse(election.brand_colors) : (election.brand_colors || {}),
//   questions: questions,
//   topicVideoUrl: election.topic_video_url,  // Add this line
//   startDate: {
//     date: election.start_date,
//     time: election.start_time
//   },
//   endDate: {
//     date: election.end_date,
//     time: election.end_time
//   }
// };

//     return parsedElection;
//   } catch (error) {
//     console.error('Error fetching complete election data:', error);
//     throw error;
//   }
// }










// //this is the last workable code
// //one route call for all operation
// import { uploadImage, uploadOptions, deleteImage } from '../config/cloudinary.js';
// //import db from '../config/database.js';
// import { pgPool as db } from '../config/database.js';
// //import { uploadImage, uploadOptions, deleteImage } from '../services/cloudinaryService.js';

// // Create Election
// export const createElection = async (req, res) => {
//   const client = await db.connect();
  
//   try {
//     await client.query('BEGIN');
    
//     const {
//       title,
//       description,
//       topicVideoUrl,
//       customVotingUrl,
//       startDate,
//       endDate,
//       startTime,
//       endTime,
//       timezone,
//       votingType,
//       permissionToVote,
//       questions,
//       authMethod,
//       biometricRequired,
//       allowOauth,
//       allowMagicLink,
//       allowEmailPassword,
//       isCountrySpecific,
//       countries,
//       pricingType,
//       isPaid,
//       participationFee,
//       regionalFees,
//       processingFeePercentage,
//       projectedRevenue,
//       revenueSharePercentage,
//       isLotterized,
//       rewardType,
//       rewardAmount,
//       nonMonetaryReward,
//       winnerCount,
//       showLiveResults,
//       allowVoteEditing,
//       customCss,
//       brandColors,
//       primaryLanguage,
//       supportsMultilang,
//       isDraft,
//       isPublished,
//       creatorId
//     } = req.body;
//     console.log('📍 Debug values received:');
// console.log('📍 startDate:', startDate, 'type:', typeof startDate);
// console.log('📍 endDate:', endDate, 'type:', typeof endDate);
// console.log('📍 startTime:', startTime, 'type:', typeof startTime);
// console.log('📍 endTime:', endTime, 'type:', typeof endTime);
// console.log('📍 Full req.body.startDate:', req.body.startDate);
// console.log('📍 Full req.body.endDate:', req.body.endDate);
// //console.log("📌 Full req.body content:", JSON.stringify(req.body, null, 2));
// console.log("req.body====>", req.body)


//     // Parse JSON strings if they exist
//     const parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
//     const parsedCountries = typeof countries === 'string' ? JSON.parse(countries) : countries;
//     const parsedRegionalFees = typeof regionalFees === 'string' ? JSON.parse(regionalFees) : regionalFees;
//     const parsedBrandColors = typeof brandColors === 'string' ? JSON.parse(brandColors) : brandColors;

//     console.log('🚀 Starting election creation process...');

//     // Step 1: Insert main election data and get election ID
//     const electionQuery = `
//       INSERT INTO vottery_elections (
//         title, description, topic_video_url, custom_voting_url,
//         start_date, end_date, start_time, end_time, timezone,
//         voting_type, permission_to_vote, auth_method, biometric_required,
//         allow_oauth, allow_magic_link, allow_email_password,
//         is_country_specific, countries, pricing_type, is_paid,
//         participation_fee, regional_fees, processing_fee_percentage,
//         projected_revenue, revenue_share_percentage, show_live_results,
//         allow_vote_editing, custom_css, brand_colors, primary_language,
//         supports_multilang, is_draft, is_published, creator_id,
//         last_saved
//       ) VALUES (
//         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
//         $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
//         $31, $32, $33, $34, CURRENT_TIMESTAMP
//       ) RETURNING id
//     `;

//     //after correction
//     const electionValues = [
//   title, description, topicVideoUrl, customVotingUrl,
//   startDate?.date || startDate || null,
//   endDate?.date || endDate || null,
//   startTime || '09:00', endTime || '18:00', timezone || 'UTC',
//   votingType || 'plurality', permissionToVote || 'open',
//   authMethod || 'passkey', biometricRequired || false,
//   allowOauth !== false, allowMagicLink !== false, allowEmailPassword !== false,
//   isCountrySpecific || false, JSON.stringify(parsedCountries || []),
//   pricingType || 'free', isPaid || false,
//   participationFee || 0, JSON.stringify(parsedRegionalFees || {}),
//   processingFeePercentage || 0, projectedRevenue || 0,
//   revenueSharePercentage || 0, showLiveResults !== false,
//   allowVoteEditing !== false, customCss || '',
//   JSON.stringify(parsedBrandColors || {}), primaryLanguage || 'en',
//   supportsMultilang || false, isDraft !== false,
//   isPublished || false, creatorId || 1
// ];


//     // const electionValues = [
//     //   title, description, topicVideoUrl, customVotingUrl,
//     //   //startDate?.date || null, endDate?.date || null, 
//     //   startDate || null, endDate || null,
//     //   startTime || '09:00', endTime || '18:00', timezone || 'UTC',
//     //   votingType || 'plurality', permissionToVote || 'open',
//     //   authMethod || 'passkey', biometricRequired || false,
//     //   allowOauth !== false, allowMagicLink !== false, allowEmailPassword !== false,
//     //   isCountrySpecific || false, JSON.stringify(parsedCountries || []),
//     //   pricingType || 'free', isPaid || false,
//     //   participationFee || 0, JSON.stringify(parsedRegionalFees || {}),
//     //   processingFeePercentage || 0, projectedRevenue || 0,
//     //   revenueSharePercentage || 0, showLiveResults !== false,
//     //   allowVoteEditing !== false, customCss || '',
//     //   JSON.stringify(parsedBrandColors || {}), primaryLanguage || 'en',
//     //   supportsMultilang || false, isDraft !== false,
//     //   isPublished || false, creatorId || 1
//     // ];

//     const electionResult = await client.query(electionQuery, electionValues);
//     const electionId = electionResult.rows[0].id;

//     console.log(`✅ Election created with ID: ${electionId}`);

//     // Step 2: Handle image uploads and update URLs
//     let topicImageUrl = null;
//     let logoBrandingUrl = null;

//     // Upload topic image
//     if (req.files?.topicImage?.[0]) {
//       try {
//         console.log('📸 Uploading topic image...');
//         const topicImageResult = await uploadImage(
//           req.files.topicImage[0].buffer,
//           {
//             ...uploadOptions.elections,
//             public_id: `vottery/elections/${electionId}/topic_${Date.now()}`
//           }
//         );
//         topicImageUrl = topicImageResult.secure_url;

//         // Save image record
//         await client.query(`
//           INSERT INTO vottery_election_images 
//           (election_id, image_type, cloudinary_public_id, cloudinary_url, original_filename)
//           VALUES ($1, $2, $3, $4, $5)
//         `, [electionId, 'topic', topicImageResult.public_id, topicImageUrl, req.files.topicImage[0].originalname]);

//         console.log('✅ Topic image uploaded successfully');
//       } catch (error) {
//         console.error('❌ Topic image upload failed:', error);
//       }
//     }

//     // Upload logo branding image
//     if (req.files?.logoBranding?.[0]) {
//       try {
//         console.log('🎨 Uploading logo branding image...');
//         const logoResult = await uploadImage(
//           req.files.logoBranding[0].buffer,
//           {
//             ...uploadOptions.logos,
//             public_id: `vottery/elections/${electionId}/logo_${Date.now()}`
//           }
//         );
//         logoBrandingUrl = logoResult.secure_url;

//         // Save image record
//         await client.query(`
//           INSERT INTO vottery_election_images 
//           (election_id, image_type, cloudinary_public_id, cloudinary_url, original_filename)
//           VALUES ($1, $2, $3, $4, $5)
//         `, [electionId, 'logo', logoResult.public_id, logoBrandingUrl, req.files.logoBranding[0].originalname]);

//         console.log('✅ Logo branding image uploaded successfully');
//       } catch (error) {
//         console.error('❌ Logo branding upload failed:', error);
//       }
//     }

//     // Update election with image URLs
//     if (topicImageUrl || logoBrandingUrl) {
//       await client.query(`
//         UPDATE vottery_elections 
//         SET topic_image_url = COALESCE($1, topic_image_url),
//             logo_branding_url = COALESCE($2, logo_branding_url),
//             updated_at = CURRENT_TIMESTAMP
//         WHERE id = $3
//       `, [topicImageUrl, logoBrandingUrl, electionId]);
//     }

//     // Step 3: Insert questions and their answers
//     if (parsedQuestions && parsedQuestions.length > 0) {
//       console.log(`📝 Creating ${parsedQuestions.length} questions...`);

//       for (let i = 0; i < parsedQuestions.length; i++) {
//         const question = parsedQuestions[i];
        
//         // Insert question
//         const questionQuery = `
//           INSERT INTO vottery_election_questions (
//             election_id, question_text, question_type, is_required,
//             allow_other_option, character_limit, question_order, question_external_id
//           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
//         `;

//         const questionValues = [
//           electionId,
//           question.questionText,
//           question.questionType || 'multiple_choice',
//           question.isRequired !== false,
//           question.allowOtherOption || false,
//           question.characterLimit || 5000,
//           i + 1,
//           question.id
//         ];

//         const questionResult = await client.query(questionQuery, questionValues);
//         const questionId = questionResult.rows[0].id;

//         // Handle question image upload
//         if (req.files?.questionImages) {
//           const questionImageFile = req.files.questionImages.find(file => 
//             file.fieldname === `questionImages` && file.originalname.includes(question.id)
//           );

//           if (questionImageFile) {
//             try {
//               console.log(`📷 Uploading image for question ${i + 1}...`);
//               const questionImageResult = await uploadImage(
//                 questionImageFile.buffer,
//                 {
//                   ...uploadOptionsquestions,
//                   public_id: `vottery/elections/${electionId}/questions/q${questionId}_${Date.now()}`
//                 }
//               );

//               // Update question with image URL
//               await client.query(`
//                 UPDATE vottery_election_questions 
//                 SET question_image_url = $1 
//                 WHERE id = $2
//               `, [questionImageResult.secure_url, questionId]);

//               // Save image record
//               await client.query(`
//                 INSERT INTO vottery_election_images 
//                 (election_id, image_type, cloudinary_public_id, cloudinary_url, original_filename, reference_id)
//                 VALUES ($1, $2, $3, $4, $5, $6)
//               `, [electionId, 'question', questionImageResult.public_id, questionImageResult.secure_url, questionImageFile.originalname, questionId]);

//               console.log(`✅ Question ${i + 1} image uploaded successfully`);
//             } catch (error) {
//               console.error(`❌ Question ${i + 1} image upload failed:`, error);
//             }
//           }
//         }

//         // Insert answers for this question
//         if (question.answers && question.answers.length > 0) {
//           console.log(`📋 Creating ${question.answers.length} answers for question ${i + 1}...`);

//           for (let j = 0; j < question.answers.length; j++) {
//             const answer = question.answers[j];

//             const answerQuery = `
//               INSERT INTO vottery_question_answers (
//                 question_id, answer_text, answer_order, answer_external_id
//               ) VALUES ($1, $2, $3, $4) RETURNING id
//             `;

//             const answerValues = [
//               questionId,
//               answer.text,
//               j + 1,
//               answer.id
//             ];

//             const answerResult = await client.query(answerQuery, answerValues);
//             const answerId = answerResult.rows[0].id;

//             // Handle answer image upload
//             if (req.files?.answerImages) {
//               const answerImageFile = req.files.answerImages.find(file => 
//                 file.fieldname === `answerImages` && file.originalname.includes(answer.id)
//               );

//               if (answerImageFile) {
//                 try {
//                   console.log(`🖼️ Uploading image for answer ${j + 1} of question ${i + 1}...`);
//                   const answerImageResult = await uploadImage(
//                     answerImageFile.buffer,
//                     {
//                       ...uploadOptions.answers,
//                       public_id: `vottery/elections/${electionId}/answers/a${answerId}_${Date.now()}`
//                     }
//                   );

//                   // Update answer with image URL
//                   await client.query(`
//                     UPDATE vottery_question_answers 
//                     SET answer_image_url = $1 
//                     WHERE id = $2
//                   `, [answerImageResult.secure_url, answerId]);

//                   // Save image record
//                   await client.query(`
//                     INSERT INTO vottery_election_images 
//                     (election_id, image_type, cloudinary_public_id, cloudinary_url, original_filename, reference_id)
//                     VALUES ($1, $2, $3, $4, $5, $6)
//                   `, [electionId, 'answer', answerImageResult.public_id, answerImageResult.secure_url, answerImageFile.originalname, answerId]);

//                   console.log(`✅ Answer ${j + 1} image uploaded successfully`);
//                 } catch (error) {
//                   console.error(`❌ Answer ${j + 1} image upload failed:`, error);
//                 }
//               }
//             }
//           }
//         }
//       }
//     }

//     // Step 4: Insert lottery configuration if enabled
//     if (isLotterized) {
//       console.log('🎰 Setting up lottery configuration...');
      
//       const lotteryQuery = `
//         INSERT INTO vottery_election_lottery (
//           election_id, is_lotterized, reward_type, reward_amount,
//           non_monetary_reward, winner_count, lottery_active
//         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
//       `;

//       const lotteryValues = [
//         electionId,
//         true,
//         rewardType || 'monetary',
//         rewardAmount || 0,
//         nonMonetaryReward || '',
//         winnerCount || 1,
//         true
//       ];

//       await client.query(lotteryQuery, lotteryValues);
//       console.log('✅ Lottery configuration saved successfully');
//     }

//     await client.query('COMMIT');

//     // Fetch the complete election data to return
//     const completeElection = await getCompleteElectionData(electionId, client);

//     console.log(`🎉 Election creation completed successfully! Election ID: ${electionId}`);

//     res.status(201).json({
//       success: true,
//       message: 'Election created successfully',
//       data: completeElection
//     });

//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Election creation failed:', error);
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create election',
//       error: error.message
//     });
//   } finally {
//     client.release();
//   }
// };

// // Get Election by ID
// export const getElection = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const client = await db.connect();
    
//     const election = await getCompleteElectionData(id, client);
    
//     if (!election) {
//       return res.status(404).json({
//         success: false,
//         message: 'Election not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: election
//     });

//     client.release();
//   } catch (error) {
//     console.error('❌ Get election failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch election',
//       error: error.message
//     });
//   }
// };

// // Get All Elections
// export const getAllElections = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, status, creatorId } = req.query;
//     const offset = (page - 1) * limit;

//     let whereClause = 'WHERE 1=1';
//     const queryParams = [];
//     let paramCount = 0;

//     if (status) {
//       paramCount++;
//       whereClause += ` AND is_published = $${paramCount}`;
//       queryParams.push(status === 'published');
//     }

//     if (creatorId) {
//       paramCount++;
//       whereClause += ` AND creator_id = $${paramCount}`;
//       queryParams.push(creatorId);
//     }

//     paramCount++;
//     const limitParam = paramCount;
//     paramCount++;
//     const offsetParam = paramCount;

//     const electionsQuery = `
//       SELECT 
//         e.*,
//         COUNT(eq.id) as question_count,
//         el.is_lotterized,
//         el.reward_amount,
//         el.winner_count
//       FROM vottery_elections e
//       LEFT JOIN vottery_election_questions eq ON e.id = eq.election_id
//       LEFT JOIN vottery_election_lottery el ON e.id = el.election_id
//       ${whereClause}
//       GROUP BY e.id, el.is_lotterized, el.reward_amount, el.winner_count
//       ORDER BY e.created_at DESC
//       LIMIT $${limitParam} OFFSET $${offsetParam}
//     `;

//     queryParams.push(limit, offset);

//     const client = await db.connect();
//     const result = await client.query(electionsQuery, queryParams);

//     // Get total count
//     const countQuery = `SELECT COUNT(*) FROM vottery_elections e ${whereClause}`;
//     const countResult = await client.query(countQuery, queryParams.slice(0, -2));
//     const totalCount = parseInt(countResult.rows[0].count);

//     res.json({
//       success: true,
//       data: {
//         elections: result.rows,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(totalCount / limit),
//           totalCount,
//           hasNext: page * limit < totalCount,
//           hasPrev: page > 1
//         }
//       }
//     });

//     client.release();
//   } catch (error) {
//     console.error('❌ Get all elections failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch elections',
//       error: error.message
//     });
//   }
// };

// // Update Election
// export const updateElection = async (req, res) => {
//   const client = await db.connect();
  
//   try {
//     await client.query('BEGIN');
    
//     const { id } = req.params;
//     const updateData = req.body;

//     // Check if election exists
//     const existingElection = await client.query('SELECT * FROM vottery_elections WHERE id = $1', [id]);
//     if (existingElection.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Election not found'
//       });
//     }

//     // Build dynamic update query
//     const updateFields = [];
//     const updateValues = [];
//     let paramCount = 0;

//     Object.keys(updateData).forEach(key => {
//       if (updateData[key] !== undefined && key !== 'questions') {
//         paramCount++;
//         updateFields.push(`${key} = $${paramCount}`);
//         updateValues.push(updateData[key]);
//       }
//     });

//     if (updateFields.length > 0) {
//       paramCount++;
//       updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
//       updateFields.push(`last_saved = CURRENT_TIMESTAMP`);
      
//       const updateQuery = `
//         UPDATE vottery_elections 
//         SET ${updateFields.join(', ')}
//         WHERE id = $${paramCount}
//       `;
//       updateValues.push(id);

//       await client.query(updateQuery, updateValues);
//     }

//     await client.query('COMMIT');

//     // Fetch updated election
//     const updatedElection = await getCompleteElectionData(id, client);

//     res.json({
//       success: true,
//       message: 'Election updated successfully',
//       data: updatedElection
//     });

//     client.release();
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Update election failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update election',
//       error: error.message
//     });
//   }
// };

// // Delete Election
// export const deleteElection = async (req, res) => {
//   const client = await db.connect();
  
//   try {
//     await client.query('BEGIN');
    
//     const { id } = req.params;

//     // Get all images associated with this election
//     const imagesResult = await client.query(
//       'SELECT cloudinary_public_id FROM vottery_election_images WHERE election_id = $1',
//       [id]
//     );

//     // Delete from Cloudinary
//     for (const image of imagesResult.rows) {
//       try {
//         await deleteImage(image.cloudinary_public_id);
//       } catch (error) {
//         console.error(`Failed to delete image ${image.cloudinary_public_id}:`, error);
//       }
//     }

//     // Delete election (cascade will handle related records)
//     const deleteResult = await client.query('DELETE FROM vottery_elections WHERE id = $1', [id]);
    
//     if (deleteResult.rowCount === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Election not found'
//       });
//     }

//     await client.query('COMMIT');

//     res.json({
//       success: true,
//       message: 'Election deleted successfully'
//     });

//     client.release();
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Delete election failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete election',
//       error: error.message
//     });
//   }
// };

// // Helper function to get complete election data
// async function getCompleteElectionData(electionId, client) {
//   try {
//     // Get main election data
//     const electionResult = await client.query(`
//       SELECT e.*, el.is_lotterized, el.reward_type, el.reward_amount, 
//              el.non_monetary_reward, el.winner_count, el.lottery_active
//       FROM vottery_elections e
//       LEFT JOIN vottery_election_lottery el ON e.id = el.election_id
//       WHERE e.id = $1
//     `, [electionId]);

//     if (electionResult.rows.length === 0) {
//       return null;
//     }

//     const election = electionResult.rows[0];

//     // Get questions with answers
//     const questionsResult = await client.query(`
//       SELECT eq.*, qa.id as answer_id, qa.answer_text, qa.answer_image_url, 
//              qa.answer_order, qa.answer_external_id
//       FROM vottery_election_questions eq
//       LEFT JOIN vottery_question_answers qa ON eq.id = qa.question_id
//       WHERE eq.election_id = $1
//       ORDER BY eq.question_order, qa.answer_order
//     `, [electionId]);

//     // Group questions with their answers
//     const questionsMap = new Map();
    
//     questionsResult.rows.forEach(row => {
//       if (!questionsMap.has(row.id)) {
//         questionsMap.set(row.id, {
//           id: row.question_external_id || row.id,
//           questionText: row.question_text,
//           questionType: row.question_type,
//           questionImageUrl: row.question_image_url,
//           isRequired: row.is_required,
//           allowOtherOption: row.allow_other_option,
//           characterLimit: row.character_limit,
//           answers: []
//         });
//       }

//       if (row.answer_id) {
//         questionsMap.get(row.id).answers.push({
//           id: row.answer_external_id || row.answer_id,
//           text: row.answer_text,
//           imageUrl: row.answer_image_url
//         });
//       }
//     });

//     const questions = Array.from(questionsMap.values());

//     // Parse JSON fields
//     const parsedElection = {
//       ...election,
//       countries: election.countries ? JSON.parse(election.countries) : [],
//       regionalFees: election.regional_fees ? JSON.parse(election.regional_fees) : {},
//       brandColors: election.brand_colors ? JSON.parse(election.brand_colors) : {},
//       questions: questions,
//       startDate: {
//         date: election.start_date,
//         time: election.start_time
//       },
//       endDate: {
//         date: election.end_date,
//         time: election.end_time
//       }
//     };

//     return parsedElection;
//   } catch (error) {
//     console.error('Error fetching complete election data:', error);
//     throw error;
//   }
// }
// import { 
//   Election, 
//   Question, 
//   Answer, 
//   ElectionAccess, 
//   ElectionBranding, 
//   ElectionLottery, 
//   ElectionSecurity 
// } from '../models/index.js';
// import { electionService } from '../services/electionService.js';
// import { validationResult } from 'express-validator';
// import { 
//   USER_TYPES, 
//   ADMIN_ROLES, 
//   ELECTION_STATUSES,
//   SUBSCRIPTION_LIMITS 
// } from '../config/constants.js';

// class ElectionController {
//   // Create new election
//   async createElection(req, res) {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           success: false,
//           message: 'Validation failed',
//           errors: errors.array()
//         });
//       }

//       const { user } = req;
//       const electionData = req.body;

//       // Check user permissions and limits
//       const canCreate = await this.checkElectionCreationPermission(user);
//       if (!canCreate.allowed) {
//         return res.status(403).json({
//           success: false,
//           message: canCreate.message
//         });
//       }

//       // Create election with all related data
//       const election = await electionService.createElection(user.id, electionData);

//       return res.status(201).json({
//         success: true,
//         message: 'Election created successfully',
//         data: {
//           election,
//           election_url: `/elections/${election.unique_election_id}`,
//           custom_url: election.custom_voting_url ? `/vote/${election.custom_voting_url}` : null
//         }
//       });

//     } catch (error) {
//       console.error('Create election error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to create election',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Get election by ID
//   async getElection(req, res) {
//     try {
//       const { id } = req.params;
//       const { user } = req;

//       const election = await electionService.getElectionById(id, user?.id);
      
//       if (!election) {
//         return res.status(404).json({
//           success: false,
//           message: 'Election not found'
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         data: election
//       });

//     } catch (error) {
//       console.error('Get election error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve election',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Get elections list with filters
//   async getElections(req, res) {
//     try {
//       const { user } = req;
//       const filters = {
//         status: req.query.status,
//         voting_type: req.query.voting_type,
//         creator_id: req.query.creator_id,
//         search: req.query.search,
//         page: parseInt(req.query.page) || 1,
//         limit: parseInt(req.query.limit) || 10,
//         sort_by: req.query.sort_by || 'created_at',
//         sort_order: req.query.sort_order || 'desc'
//       };

//       const result = await electionService.getElections(filters, user?.id);

//       return res.status(200).json({
//         success: true,
//         data: result.elections,
//         pagination: {
//           current_page: result.currentPage,
//           total_pages: result.totalPages,
//           total_count: result.totalCount,
//           per_page: result.perPage
//         }
//       });

//     } catch (error) {
//       console.error('Get elections error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve elections',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Update election
//   async updateElection(req, res) {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           success: false,
//           message: 'Validation failed',
//           errors: errors.array()
//         });
//       }

//       const { id } = req.params;
//       const { user } = req;
//       const updateData = req.body;

//       // Check if user can update this election
//       const election = await Election.findByPk(id);
//       if (!election) {
//         return res.status(404).json({
//           success: false,
//           message: 'Election not found'
//         });
//       }

//       const canUpdate = await this.checkElectionUpdatePermission(user, election);
//       if (!canUpdate.allowed) {
//         return res.status(403).json({
//           success: false,
//           message: canUpdate.message
//         });
//       }

//       // Update election
//       const updatedElection = await electionService.updateElection(id, updateData, user.id);

//       return res.status(200).json({
//         success: true,
//         message: 'Election updated successfully',
//         data: updatedElection
//       });

//     } catch (error) {
//       console.error('Update election error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to update election',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Delete election
//   async deleteElection(req, res) {
//     try {
//       const { id } = req.params;
//       const { user } = req;

//       const election = await Election.findByPk(id);
//       if (!election) {
//         return res.status(404).json({
//           success: false,
//           message: 'Election not found'
//         });
//       }

//       const canDelete = await this.checkElectionDeletePermission(user, election);
//       if (!canDelete.allowed) {
//         return res.status(403).json({
//           success: false,
//           message: canDelete.message
//         });
//       }

//       await electionService.deleteElection(id, user.id);

//       return res.status(200).json({
//         success: true,
//         message: 'Election deleted successfully'
//       });

//     } catch (error) {
//       console.error('Delete election error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to delete election',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Clone election
//   async cloneElection(req, res) {
//     try {
//       const { id } = req.params;
//       const { user } = req;
//       const { modifications = {} } = req.body;

//       const originalElection = await Election.findByPk(id);
//       if (!originalElection) {
//         return res.status(404).json({
//           success: false,
//           message: 'Original election not found'
//         });
//       }

//       // Check permissions
//       const canClone = await this.checkElectionCreationPermission(user);
//       if (!canClone.allowed) {
//         return res.status(403).json({
//           success: false,
//           message: canClone.message
//         });
//       }

//       const clonedElection = await electionService.cloneElection(id, user.id, modifications);

//       return res.status(201).json({
//         success: true,
//         message: 'Election cloned successfully',
//         data: {
//           election: clonedElection,
//           original_election_id: id
//         }
//       });

//     } catch (error) {
//       console.error('Clone election error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to clone election',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Activate election (change from draft to active)
//   async activateElection(req, res) {
//     try {
//       const { id } = req.params;
//       const { user } = req;

//       const election = await Election.findByPk(id);
//       if (!election) {
//         return res.status(404).json({
//           success: false,
//           message: 'Election not found'
//         });
//       }

//       const canActivate = await this.checkElectionUpdatePermission(user, election);
//       if (!canActivate.allowed) {
//         return res.status(403).json({
//           success: false,
//           message: canActivate.message
//         });
//       }

//       const activatedElection = await electionService.activateElection(id, user.id);

//       return res.status(200).json({
//         success: true,
//         message: 'Election activated successfully',
//         data: activatedElection
//       });

//     } catch (error) {
//       console.error('Activate election error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to activate election',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Get election statistics
//   async getElectionStats(req, res) {
//     try {
//       const { id } = req.params;
//       const { user } = req;

//       const election = await Election.findByPk(id);
//       if (!election) {
//         return res.status(404).json({
//           success: false,
//           message: 'Election not found'
//         });
//       }

//       const canViewStats = await this.checkElectionViewPermission(user, election);
//       if (!canViewStats.allowed) {
//         return res.status(403).json({
//           success: false,
//           message: canViewStats.message
//         });
//       }

//       const stats = await electionService.getElectionStatistics(id);

//       return res.status(200).json({
//         success: true,
//         data: stats
//       });

//     } catch (error) {
//       console.error('Get election stats error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve election statistics',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Export election data
//   async exportElection(req, res) {
//     try {
//       const { id } = req.params;
//       const { user } = req;
//       const { format = 'json' } = req.query;

//       const election = await Election.findByPk(id);
//       if (!election) {
//         return res.status(404).json({
//           success: false,
//           message: 'Election not found'
//         });
//       }

//       const canExport = await this.checkElectionViewPermission(user, election);
//       if (!canExport.allowed) {
//         return res.status(403).json({
//           success: false,
//           message: canExport.message
//         });
//       }

//       const exportData = await electionService.exportElectionData(id, format);

//       // Set appropriate headers based on format
//       if (format === 'csv') {
//         res.setHeader('Content-Type', 'text/csv');
//         res.setHeader('Content-Disposition', `attachment; filename=election_${id}.csv`);
//       } else {
//         res.setHeader('Content-Type', 'application/json');
//         res.setHeader('Content-Disposition', `attachment; filename=election_${id}.json`);
//       }

//       return res.status(200).send(exportData);

//     } catch (error) {
//       console.error('Export election error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to export election data',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Update election branding
//   async updateBranding(req, res) {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           success: false,
//           message: 'Validation failed',
//           errors: errors.array()
//         });
//       }

//       const { id } = req.params;
//       const { user } = req;
//       const brandingData = req.body;

//       const election = await Election.findByPk(id);
//       if (!election) {
//         return res.status(404).json({
//           success: false,
//           message: 'Election not found'
//         });
//       }

//       const canUpdate = await this.checkElectionUpdatePermission(user, election);
//       if (!canUpdate.allowed) {
//         return res.status(403).json({
//           success: false,
//           message: canUpdate.message
//         });
//       }

//       const updatedBranding = await electionService.updateElectionBranding(id, brandingData);

//       return res.status(200).json({
//         success: true,
//         message: 'Election branding updated successfully',
//         data: updatedBranding
//       });

//     } catch (error) {
//       console.error('Update branding error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to update election branding',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Update election access control
//   async updateAccessControl(req, res) {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           success: false,
//           message: 'Validation failed',
//           errors: errors.array()
//         });
//       }

//       const { id } = req.params;
//       const { user } = req;
//       const accessData = req.body;

//       const election = await Election.findByPk(id);
//       if (!election) {
//         return res.status(404).json({
//           success: false,
//           message: 'Election not found'
//         });
//       }

//       const canUpdate = await this.checkElectionUpdatePermission(user, election);
//       if (!canUpdate.allowed) {
//         return res.status(403).json({
//           success: false,
//           message: canUpdate.message
//         });
//       }

//       const updatedAccess = await electionService.updateElectionAccess(id, accessData);

//       return res.status(200).json({
//         success: true,
//         message: 'Election access control updated successfully',
//         data: updatedAccess
//       });

//     } catch (error) {
//       console.error('Update access control error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to update election access control',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Update election security settings
//   async updateSecurity(req, res) {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           success: false,
//           message: 'Validation failed',
//           errors: errors.array()
//         });
//       }

//       const { id } = req.params;
//       const { user } = req;
//       const securityData = req.body;

//       const election = await Election.findByPk(id);
//       if (!election) {
//         return res.status(404).json({
//           success: false,
//           message: 'Election not found'
//         });
//       }

//       const canUpdate = await this.checkElectionUpdatePermission(user, election);
//       if (!canUpdate.allowed) {
//         return res.status(403).json({
//           success: false,
//           message: canUpdate.message
//         });
//       }

//       const updatedSecurity = await electionService.updateElectionSecurity(id, securityData);

//       return res.status(200).json({
//         success: true,
//         message: 'Election security settings updated successfully',
//         data: updatedSecurity
//       });

//     } catch (error) {
//       console.error('Update security error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to update election security settings',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Generate custom URL
//   async generateCustomUrl(req, res) {
//     try {
//       const { id } = req.params;
//       const { user } = req;
//       const { custom_url } = req.body;

//       const election = await Election.findByPk(id);
//       if (!election) {
//         return res.status(404).json({
//           success: false,
//           message: 'Election not found'
//         });
//       }

//       const canUpdate = await this.checkElectionUpdatePermission(user, election);
//       if (!canUpdate.allowed) {
//         return res.status(403).json({
//           success: false,
//           message: canUpdate.message
//         });
//       }

//       const updatedElection = await electionService.generateCustomUrl(id, custom_url);

//       return res.status(200).json({
//         success: true,
//         message: 'Custom URL generated successfully',
//         data: {
//           election_id: id,
//           custom_url: updatedElection.custom_voting_url,
//           full_url: `/vote/${updatedElection.custom_voting_url}`
//         }
//       });

//     } catch (error) {
//       console.error('Generate custom URL error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to generate custom URL',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Get user's elections
//   async getUserElections(req, res) {
//     try {
//       const { user } = req;
//       const filters = {
//         status: req.query.status,
//         page: parseInt(req.query.page) || 1,
//         limit: parseInt(req.query.limit) || 10,
//         sort_by: req.query.sort_by || 'created_at',
//         sort_order: req.query.sort_order || 'desc'
//       };

//       const result = await electionService.getUserElections(user.id, filters);

//       return res.status(200).json({
//         success: true,
//         data: result.elections,
//         pagination: {
//           current_page: result.currentPage,
//           total_pages: result.totalPages,
//           total_count: result.totalCount,
//           per_page: result.perPage
//         }
//       });

//     } catch (error) {
//       console.error('Get user elections error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve user elections',
//         error: process.env.NODE_ENV === 'development' ? error.message : undefined
//       });
//     }
//   }

//   // Helper methods for permission checking
//   async checkElectionCreationPermission(user) {
//     // Check if user exists
//     if (!user) {
//       return { allowed: false, message: 'Authentication required' };
//     }

//     // Admin roles can always create
//     if (user.admin_role && [ADMIN_ROLES.MANAGER, ADMIN_ROLES.ADMIN, ADMIN_ROLES.MODERATOR].includes(user.admin_role)) {
//       return { allowed: true };
//     }

//     // Check user type and subscription
//     if (user.user_type === USER_TYPES.INDIVIDUAL_FREE || user.user_type === USER_TYPES.ORGANIZATION_FREE) {
//       // Check election limit for free users
//       const userElectionCount = await Election.count({
//         where: { creator_id: user.id }
//       });

//       if (userElectionCount >= SUBSCRIPTION_LIMITS.FREE_ELECTION_LIMIT) {
//         return { 
//           allowed: false, 
//           message: `Free users can create maximum ${SUBSCRIPTION_LIMITS.FREE_ELECTION_LIMIT} elections. Please upgrade to create more.` 
//         };
//       }
//     }

//     // Check subscription status
//     if (user.subscription_status === 'expired' || user.subscription_status === 'cancelled') {
//       return { 
//         allowed: false, 
//         message: 'Active subscription required to create elections' 
//       };
//     }

//     return { allowed: true };
//   }

//   async checkElectionUpdatePermission(user, election) {
//     // Check if user exists
//     if (!user) {
//       return { allowed: false, message: 'Authentication required' };
//     }

//     // Admin roles can update any election
//     if (user.admin_role && [ADMIN_ROLES.MANAGER, ADMIN_ROLES.ADMIN, ADMIN_ROLES.MODERATOR].includes(user.admin_role)) {
//       return { allowed: true };
//     }

//     // Check if user is the creator
//     if (election.creator_id !== user.id) {
//       return { allowed: false, message: 'Only election creator can update this election' };
//     }

//     // Check if election can be edited
//     if (!election.canEdit()) {
//       return { allowed: false, message: 'Election cannot be edited in current status' };
//     }

//     return { allowed: true };
//   }

//   async checkElectionDeletePermission(user, election) {
//     // Check if user exists
//     if (!user) {
//       return { allowed: false, message: 'Authentication required' };
//     }

//     // Admin roles can delete any election
//     if (user.admin_role && [ADMIN_ROLES.MANAGER, ADMIN_ROLES.ADMIN].includes(user.admin_role)) {
//       return { allowed: true };
//     }

//     // Check if user is the creator
//     if (election.creator_id !== user.id) {
//       return { allowed: false, message: 'Only election creator can delete this election' };
//     }

//     // Check if election can be deleted
//     if (!election.canDelete()) {
//       return { allowed: false, message: 'Election cannot be deleted - it has votes or is not in draft status' };
//     }

//     return { allowed: true };
//   }

//   async checkElectionViewPermission(user, election) {
//     // Admin roles can view any election
//     if (user?.admin_role && [ADMIN_ROLES.MANAGER, ADMIN_ROLES.ADMIN, ADMIN_ROLES.MODERATOR, ADMIN_ROLES.ANALYST].includes(user.admin_role)) {
//       return { allowed: true };
//     }

//     // Election creator can always view
//     if (user && election.creator_id === user.id) {
//       return { allowed: true };
//     }

//     // Public elections can be viewed by anyone
//     if (election.status === ELECTION_STATUSES.ACTIVE) {
//       return { allowed: true };
//     }

//     return { allowed: false, message: 'No permission to view this election' };
//   }
// }

// export default new ElectionController();