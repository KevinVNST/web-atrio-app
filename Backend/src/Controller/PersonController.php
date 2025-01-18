<?php

namespace App\Controller;

use App\Entity\Person;
use App\Repository\PersonRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Nelmio\ApiDocBundle\Annotation\Model;
use OpenApi\Annotations as OA;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

final class PersonController extends AbstractController
{
    #[Route('/persons', methods: ['GET'])]
    /**
     * @OA\Get(
     *     path="/persons",
     *     summary="List all persons",
     *     @OA\Response(
     *         response=200,
     *         description="List of persons",
     *         @OA\JsonContent(type="array", @OA\Items(ref=@Model(type=App\Entity\Person::class, groups={"person:read"})))
     *     )
     * )
     */
    public function listPersons(PersonRepository $personRepo, SerializerInterface $serializer): Response
    {
        $persons = $personRepo->findBy([], ['lastname' => 'ASC']);

        return new Response(
            $serializer->serialize($persons, 'json', ['groups' => ['person:read']]),
            Response::HTTP_OK,
            ['Content-Type' => 'application/json']
        );
    }

    #[Route('/persons/{id}', methods: ['GET'])]
    /**
     * @OA\Get(
     *     path="/persons/{id}",
     *     summary="Get a person by ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="The ID of the person",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Person details",
     *         @OA\JsonContent(ref=@Model(type=App\Entity\Person::class, groups={"person:read"}))
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Person not found"
     *     )
     * )
     */
    public function getPerson(int $id, PersonRepository $repository): Response
    {
        $person = $repository->find($id);

        if (!$person) {
            return $this->json(['error' => 'Person not found'], Response::HTTP_NOT_FOUND);
        }

        $currentDate = new \DateTime();
        $age = $currentDate->diff($person->getDateOfBirth())->y;

        $jobs = $person->getJobs()->map(function ($job) {
            return [
                'id' => $job->getId(),
                'companyName' => $job->getCompanyName(),
                'jobName' => $job->getJobName(),
                'startDate' => $job->getStartDate()->format('Y-m-d'),
                'endDate' => $job->getEndDate() ? $job->getEndDate()->format('Y-m-d') : null,
            ];
        })->toArray();

        $data = [
            'id' => $person->getId(),
            'firstName' => $person->getFirstName(),
            'lastName' => $person->getLastName(),
            'dateOfBirth' => $person->getDateOfBirth()->format('Y-m-d'),
            'age' => $age,
            'jobs' => $jobs,
        ];

        return $this->json($data);
    }

    #[Route('/companies/{companyName}/persons', methods: ['GET'])]
    /**
     * @OA\Get(
     *     path="/companies/{companyName}/persons",
     *     summary="Get all persons working for a specific company",
     *     @OA\Parameter(
     *         name="companyName",
     *         in="path",
     *         description="The name of the company",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="List of persons",
     *         @OA\JsonContent(type="array", @OA\Items(ref=@Model(type=App\Entity\Person::class, groups={"person:read"})))
     *     )
     * )
     */
    public function getPersonsByCompany(string $companyName, PersonRepository $repository): Response
    {
        $persons = $repository->createQueryBuilder('p')
            ->select('p', 'j')
            ->leftJoin('p.jobs', 'j')
            ->where('j.companyName = :companyName')
            ->setParameter('companyName', $companyName)
            ->getQuery()
            ->getResult();

        $data = array_map(function ($person) {
            $currentDate = new \DateTime();
            $age = $currentDate->diff($person->getDateOfBirth())->y;
            return [
                'id' => $person->getId(),
                'firstName' => $person->getFirstName(),
                'lastName' => $person->getLastName(),
                'age' => $age
            ];
        }, $persons);

        return $this->json($data);
    }
    
    #[Route('/persons', methods: ['POST'])]
    /**
     * @OA\Post(
     *     path="/persons",
     *     summary="Create a new person",
     *     @OA\RequestBody(
     *         description="Person data",
     *         required=true,
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="firstname", type="string"),
     *             @OA\Property(property="lastname", type="string"),
     *             @OA\Property(property="dateOfBirth", type="string", format="date")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Person created successfully",
     *         @OA\JsonContent(ref=@Model(type=App\Entity\Person::class, groups={"person:read"}))
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid input"
     *     )
     * )
     */
    public function create(Request $request, EntityManagerInterface $em): Response
    {
        $data = json_decode($request->getContent(), true);

        $requiredFields = ['firstname', 'lastname', 'dateOfBirth'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                return $this->json(['error' => "Field '$field' is missing"], Response::HTTP_BAD_REQUEST);
            }
        }

        $dateOfBirth = new \DateTime($data['dateOfBirth']);
        $age = (new \DateTime())->diff($dateOfBirth)->y;

        if ($age > 150) {
            return $this->json(['error' => 'Age cannot exceed 150 years'], Response::HTTP_BAD_REQUEST);
        }

        $person = new Person();
        $person->setFirstName($data['firstname']);
        $person->setLastName($data['lastname']);
        $person->setDateOfBirth($dateOfBirth);

        $em->persist($person);
        $em->flush();

        return $this->json($person, Response::HTTP_CREATED);
    }
}