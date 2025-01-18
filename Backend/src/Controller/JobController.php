<?php

namespace App\Controller;

use App\Entity\Job;
use App\Repository\JobRepository;
use App\Repository\PersonRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Nelmio\ApiDocBundle\Annotation\Model;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

final class JobController extends AbstractController
{
    #[Route('/persons/{id}/jobs', methods: ['GET'])]
    /**
 * @OA\Get(
 *     path="/persons/{id}/jobs",
 *     summary="Get all jobs for a person",
 *     description="Retrieve all jobs for a person, optionally filtered by start and end dates.",
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="The ID of the person",
 *         required=true,
 *         @OA\Schema(type="integer")
 *     ),
 *     @OA\Parameter(
 *         name="startDate",
 *         in="query",
 *         description="Filter jobs starting from this date (optional)",
 *         required=false,
 *         @OA\Schema(type="string", format="date")
 *     ),
 *     @OA\Parameter(
 *         name="endDate",
 *         in="query",
 *         description="Filter jobs ending before this date (optional)",
 *         required=false,
 *         @OA\Schema(type="string", format="date")
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="List of jobs",
 *         @OA\JsonContent(type="array", @OA\Items(ref=@Model(type=App\Entity\Job::class, groups={"job"})))
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Person not found"
 *     )
 * )
 */
    public function getJobs(int $id, Request $request, PersonRepository $personRepo): Response
    {
        $startDate = $request->query->get('startDate');
        $endDate = $request->query->get('endDate');

        $person = $personRepo->find($id);

        if (!$person) {
            return $this->json(['error' => 'Person not found'], Response::HTTP_NOT_FOUND);
        }

        if ($startDate && $endDate) {
            // Filtrer les emplois entre deux dates
            $jobs = $person->getJobs()->filter(function ($job) use ($startDate, $endDate) {
                $jobStart = $job->getStartDate();
                $jobEnd = $job->getEndDate() ?: new \DateTime();

                return $jobStart <= new \DateTime($endDate) && $jobEnd >= new \DateTime($startDate);
            });
        } else {
            // Renvoyer tous les emplois si aucune plage de dates n'est fournie
            $jobs = $person->getJobs();
        }

        $data = array_map(function ($job) {
            return [
                'id' => $job->getId(),
                'companyName' => $job->getCompanyName(),
                'jobName' => $job->getJobName(),
                'startDate' => $job->getStartDate()->format('Y-m-d'),
                'endDate' => $job->getEndDate() ? $job->getEndDate()->format('Y-m-d') : null,
            ];
        }, $jobs->toArray());

        return $this->json($data);
    }

    #[Route('/companies', methods: ['GET'])]
    /**
     * @OA\Get(
     *     path="/companies",
     *     summary="Get a list of all companies",
     *     description="Retrieve a list of all unique company names.",
     *     @OA\Response(
     *         response=200,
     *         description="List of companies",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(type="string")
     *         )
     *     )
     * )
     */
    public function listCompanies(JobRepository $repository): Response
    {
        $companies = $repository->createQueryBuilder('j')
            ->select('DISTINCT j.companyName')
            ->orderBy('j.companyName', 'ASC')
            ->getQuery()
            ->getResult();

        return $this->json(array_map(fn($company) => $company['companyName'], $companies));
    }
    
    #[Route('/persons/{id}/jobs', methods: ['POST'])]
    /**
     * @OA\Post(
     *     path="/persons/{id}/jobs",
     *     summary="Add a new job for a person",
     *     description="Create a new job for a person.",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="The ID of the person",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="companyName", type="string"),
     *             @OA\Property(property="jobName", type="string"),
     *             @OA\Property(property="startDate", type="string", format="date"),
     *             @OA\Property(property="endDate", type="string", format="date", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Job created",
     *         @OA\JsonContent(ref=@Model(type=Job::class, groups={"job"}))
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Person not found"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Validation error"
     *     )
     * )
     */
    public function addJob(int $id, Request $request, PersonRepository $personRepo, EntityManagerInterface $em, SerializerInterface $serializer): Response
    {
        $person = $personRepo->find($id);

        if (!$person) {
            return $this->json(['error' => 'Person not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        $job = new Job();
        $job->setCompanyName($data['companyName']);
        $job->setJobName($data['jobName']);
        $job->setStartDate(new \DateTime($data['startDate']));

        if (!empty($data['endDate'])) {
            $job->setEndDate(new \DateTime($data['endDate']));
        }

        $job->setPerson($person);

        $em->persist($job);
        $em->flush();

        // Utiliser le groupe de sérialisation "job"
        $json = $serializer->serialize($job, 'json', [AbstractNormalizer::GROUPS => ['job']]);

        return new JsonResponse($json, Response::HTTP_CREATED, [], true);
    }

}